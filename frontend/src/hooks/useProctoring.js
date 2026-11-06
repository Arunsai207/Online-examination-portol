import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as faceapi from '@vladmandic/face-api';
import { examService } from '../services/dataService';

export const useProctoring = (attemptId) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const [warnings, setWarnings] = useState([]);
  
  // Models
  const cocoModelRef = useRef(null);

  // Initialize Camera & Models
  useEffect(() => {
    let stream = null;

    const init = async () => {
      try {
        // 1. Load face-api models
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models');

        // 2. Load COCO-SSD
        await tf.setBackend('webgl');
        cocoModelRef.current = await cocoSsd.load();

        // 3. Start Camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setIsReady(true);
      } catch (err) {
        console.error('Proctoring Setup Error:', err);
        setError('Camera permission denied or models failed to load. Please allow camera access to start the exam.');
      }
    };

    init();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Monitor Tab Switches
  useEffect(() => {
    if (!attemptId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('tab_switch', 'Student switched tabs or minimized the browser.');
      }
    };

    const handleBlur = () => {
      logViolation('window_blur', 'Exam window lost focus.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [attemptId]);

  // Main Detection Loop
  const startMonitoring = useCallback(() => {
    if (!isReady || !videoRef.current || !attemptId) return;

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (video.readyState !== 4) return;

      // --- 1. Face Detection ---
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);
      
      if (detections.length === 0) {
        logViolation('no_face_detected', 'No face was detected in the camera frame.');
      } else if (detections.length > 1) {
        logViolation('multiple_faces_detected', `Detected ${detections.length} faces in the camera frame.`);
      } else {
        // --- Suspicious Movement / Head Orientation Detection ---
        const landmarks = detections[0].landmarks;
        const nose = landmarks.getNose()[0];
        const leftEye = landmarks.getLeftEye()[0];
        const rightEye = landmarks.getRightEye()[3]; // Outer corner
        const jawOutline = landmarks.getJawOutline();
        
        const leftJaw = jawOutline[0];
        const rightJaw = jawOutline[16];

        // Calculate distances from nose to left/right jaw edges
        const distLeft = Math.abs(nose.x - leftJaw.x);
        const distRight = Math.abs(nose.x - rightJaw.x);

        // If one distance is significantly larger than the other, head is turned
        const ratio = distLeft / distRight;
        if (ratio > 2.5 || ratio < 0.4) {
          logViolation('suspicious_movement', 'Significant head turn detected (looking away from screen).');
        }
      }

      // --- 2. Object Detection (Mobile Phone) ---
      if (cocoModelRef.current) {
        const predictions = await cocoModelRef.current.detect(video);
        const phones = predictions.filter(p => p.class === 'cell phone');
        if (phones.length > 0) {
          logViolation('mobile_phone_detected', 'A mobile phone was detected in the camera frame.');
        }
      }

    }, 3000); // Check every 3 seconds

  }, [isReady, attemptId]);

  useEffect(() => {
    if (isReady && attemptId) {
      startMonitoring();
    }
  }, [isReady, attemptId, startMonitoring]);

  const logViolation = async (type, description) => {
    // Prevent spamming the same violation too rapidly (e.g., within 5 seconds)
    setWarnings(prev => {
      const lastSameWarning = prev.slice().reverse().find(w => w.type === type);
      if (lastSameWarning && (Date.now() - lastSameWarning.time < 5000)) {
        return prev;
      }
      
      // Emit violation to API
      if (attemptId) {
        examService.recordViolation(attemptId, { violation_type: type, description })
           .catch(e => console.error('Failed to log violation:', e));
      }

      return [...prev, { type, description, time: Date.now() }];
    });
  };

  return { isReady, error, videoRef, warnings };
};

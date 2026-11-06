import { useState, useEffect, useRef } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { studentService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiCamera, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const FaceRegistration = ({ user, onUpdate }) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(!!user?.face_descriptor);
  const videoRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Failed to load face-api models', err);
        toast.error('Failed to load AI models for face registration.');
      }
    };
    loadModels();
  }, []);

  const startVideo = () => {
    setIsScanning(true);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error('Camera error', err);
        toast.error('Could not access camera. Please allow permissions.');
        setIsScanning(false);
      });
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const captureAndRegister = async () => {
    if (!videoRef.current) return;
    if (videoRef.current.readyState !== 4) {
      toast.error('Camera is still initializing. Please wait a moment.');
      return;
    }
    
    toast.loading('Analyzing face...', { id: 'face-toast' });
    try {
      // Add a 10-second timeout to prevent the promise from hanging indefinitely
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Face analysis timed out')), 10000)
      );

      const detectionPromise = faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      const detection = await Promise.race([detectionPromise, timeoutPromise]);

      if (!detection) {
        toast.error('No face detected! Please look clearly at the camera.', { id: 'face-toast' });
        return;
      }

      // face-api returns a Float32Array. Convert to normal array for JSON storage.
      const descriptorArray = Array.from(detection.descriptor);

      await studentService.updateFace({ face_descriptor: descriptorArray });
      toast.success('Face successfully registered!', { id: 'face-toast' });
      
      setHasRegistered(true);
      stopVideo();
      if (onUpdate) onUpdate();
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to register face.', { id: 'face-toast' });
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4><FiCamera style={{ marginRight: '8px' }} /> Face Authentication Setup</h4>
      </div>
      <div className="card-body">
        {hasRegistered ? (
          <div style={{ textAlign: 'center', padding: '20px', background: 'var(--success-light)', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}>
            <FiCheckCircle size={48} style={{ marginBottom: '16px' }} />
            <h4>Face Registered Successfully</h4>
            <p style={{ fontSize: '0.875rem', marginTop: '8px', opacity: 0.9 }}>
              Your biometric data is securely stored. You can now take proctored exams.
            </p>
            <button className="btn btn-outline" style={{ marginTop: '16px', borderColor: 'currentColor', color: 'currentColor' }} onClick={() => setHasRegistered(false)}>
              Re-register Face
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>
              Face registration is required to verify your identity before starting an online exam.
            </p>
            
            {!modelsLoaded ? (
              <div style={{ padding: '40px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                Loading AI Models...
              </div>
            ) : isScanning ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '100%', maxWidth: '320px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '3px solid var(--primary)' }}>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-ghost" onClick={stopVideo}>Cancel</button>
                  <button className="btn btn-primary" onClick={captureAndRegister}>Capture & Register</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <FiCamera size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <br />
                <button className="btn btn-primary" onClick={startVideo}>Start Camera</button>
              </div>
            )}
            
            <div style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FiAlertCircle /> 
              <span>Look directly into the camera in a well-lit room.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceRegistration;

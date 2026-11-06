
import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { studentService } from '../../services/dataService';
import toast from 'react-hot-toast';
import { FiCamera, FiRefreshCw } from 'react-icons/fi';

const MODEL_URL = '/models';

const DETECTOR_OPTIONS = [
  { inputSize: 416, scoreThreshold: 0.1 },
  { inputSize: 608, scoreThreshold: 0.1 },
  { inputSize: 608, scoreThreshold: 0.05 }
];

const FaceVerificationModal = ({
  userDescriptor,
  onVerified,
  onCancel
}) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [failCount, setFailCount] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mountedRef = useRef(true);

  // Stop camera and release all media tracks.
  const stopVideo = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    const video = videoRef.current;

    if (video) {
      video.pause();
      video.srcObject = null;
    }

    if (mountedRef.current) {
      setCameraReady(false);
    }
  }, []);

  // Load required face recognition models.
  useEffect(() => {
    mountedRef.current = true;

    const loadModels = async () => {
      try {
        console.log('Loading face recognition models...');

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        if (!mountedRef.current) return;

        console.log('Face models loaded:', {
          tinyFaceDetector: faceapi.nets.tinyFaceDetector.isLoaded,
          faceLandmark68Net: faceapi.nets.faceLandmark68Net.isLoaded,
          faceRecognitionNet: faceapi.nets.faceRecognitionNet.isLoaded
        });

        setModelsLoaded(true);
      } catch (error) {
        console.error('Face model loading error:', error);

        toast.error(
          'Failed to load face models. Check the frontend public/models folder.'
        );
      }
    };

    loadModels();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Start the camera after the video element has been rendered.
  useEffect(() => {
    if (!modelsLoaded) return;

    let active = true;
    let currentStream = null;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            'Camera access is unavailable. Use localhost or HTTPS.'
          );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        currentStream = stream;

        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;

        if (!video) {
          throw new Error('Camera video element was not found.');
        }

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        await video.play();

        // Wait until the browser provides actual video dimensions.
        await new Promise((resolve, reject) => {
          if (video.readyState >= 2 && video.videoWidth > 0) {
            resolve();
            return;
          }

          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Camera video initialization timed out.'));
          }, 10000);

          const onReady = () => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              cleanup();
              resolve();
            }
          };

          const cleanup = () => {
            clearTimeout(timeout);
            video.removeEventListener('loadeddata', onReady);
            video.removeEventListener('playing', onReady);
          };

          video.addEventListener('loadeddata', onReady);
          video.addEventListener('playing', onReady);
        });

        if (!active) return;

        console.log('Camera initialized successfully:', {
          width: video.videoWidth,
          height: video.videoHeight,
          readyState: video.readyState
        });

        setCameraReady(true);
      } catch (error) {
        console.error('Camera initialization error:', error);

        if (active) {
          toast.error(
            error.message || 'Unable to access your camera.'
          );
        }
      }
    };

    startCamera();

    return () => {
      active = false;

      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }

      if (streamRef.current === currentStream) {
        streamRef.current = null;
      }

      const video = videoRef.current;

      if (video && video.srcObject === currentStream) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, [modelsLoaded]);

  // Check camera and model readiness.
  const isCameraReady = () => {
    const video = videoRef.current;

    return Boolean(
      video &&
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0 &&
      faceapi.nets.tinyFaceDetector.isLoaded &&
      faceapi.nets.faceLandmark68Net.isLoaded &&
      faceapi.nets.faceRecognitionNet.isLoaded
    );
  };

  // Detect a face and generate its recognition descriptor.
  const detectFace = async () => {
    const video = videoRef.current;

    if (!video) {
      throw new Error('Video element not found.');
    }

    if (!isCameraReady()) {
      throw new Error(
        'Camera is not ready. Wait until the live preview appears.'
      );
    }

    console.log('FACE DETECTION DIAGNOSTICS:', {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      readyState: video.readyState,
      paused: video.paused,
      tinyFaceDetectorLoaded: faceapi.nets.tinyFaceDetector.isLoaded,
      landmarkModelLoaded: faceapi.nets.faceLandmark68Net.isLoaded,
      recognitionModelLoaded: faceapi.nets.faceRecognitionNet.isLoaded
    });

    for (const option of DETECTOR_OPTIONS) {
      console.log('Trying face detector:', option);

      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions(option)
      );

      console.log('Faces detected:', detections.length);

      if (detections.length > 0) {
        const results = await faceapi
          .detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions(option)
          )
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (results.length > 0) {
          console.log('Face successfully detected.');
          return results[0];
        }
      }
    }

    console.warn('No face detected at any tested threshold.');

    return null;
  };

  // Convert the saved descriptor into a valid numeric array.
  const getStoredDescriptor = () => {
    let storedArray = userDescriptor;

    if (typeof storedArray === 'string') {
      try {
        storedArray = JSON.parse(storedArray);
      } catch {
        return null;
      }
    }

    if (
      !Array.isArray(storedArray) ||
      storedArray.length !== 128 ||
      !storedArray.every(
        value => typeof value === 'number' && Number.isFinite(value)
      )
    ) {
      return null;
    }

    return new Float32Array(storedArray);
  };

  // Re-register the student's face.
  const reRegisterAndVerify = async () => {
    if (isVerifying) return;

    setIsVerifying(true);

    const toastId = toast.loading('Re-registering face...');

    try {
      const detection = await detectFace();

      if (!detection) {
        toast.error(
          'No face detected. Look directly at the camera in good lighting.',
          { id: toastId }
        );
        return;
      }

      const descriptorArray = Array.from(detection.descriptor);

      if (descriptorArray.length !== 128) {
        throw new Error('Invalid face descriptor generated.');
      }

      await studentService.updateFace({
        face_descriptor: descriptorArray
      });

      toast.success(
        'Face successfully re-registered. Starting exam...',
        { id: toastId }
      );

      stopVideo();
      onVerified();
    } catch (error) {
      console.error('Face re-registration error:', error);

      toast.error(
        error.message || 'Face re-registration failed.',
        { id: toastId }
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Verify the student's registered face.
  const verifyFace = async () => {
    if (isVerifying) return;

    setIsVerifying(true);

    const toastId = toast.loading('Verifying your identity...');

    try {
      const detection = await detectFace();

      if (!detection) {
        toast.error(
          'No face detected. Look directly at the camera.',
          { id: toastId }
        );
        return;
      }

      const storedDescriptor = getStoredDescriptor();

      if (!storedDescriptor) {
        console.warn('Invalid stored face descriptor.');

        setFailCount(2);

        toast.error(
          'Stored face data is invalid. Please re-register your face.',
          { id: toastId }
        );
        return;
      }

      const distance = faceapi.euclideanDistance(
        detection.descriptor,
        storedDescriptor
      );

      console.log('Face verification distance:', distance);

      // Preserve the existing identity-matching threshold.
      if (distance < 0.7) {
        toast.success('Identity verified successfully!', {
          id: toastId
        });

        stopVideo();
        onVerified();
      } else {
        const newFailCount = failCount + 1;

        setFailCount(newFailCount);

        if (newFailCount >= 2) {
          toast.error(
            `Face mismatch (distance: ${distance.toFixed(3)}). You can re-register your face.`,
            { id: toastId }
          );
        } else {
          toast.error(
            `Face does not match (distance: ${distance.toFixed(3)}). Please try again.`,
            { id: toastId }
          );
        }
      }
    } catch (error) {
      console.error('Face verification error:', error);

      toast.error(
        error.message || 'Face verification failed.',
        { id: toastId }
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Cancel verification and release the camera.
  const handleCancel = () => {
    stopVideo();
    onCancel();
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          maxWidth: '450px',
          textAlign: 'center'
        }}
      >
        <div className="modal-header">
          <h3>Identity Verification Required</h3>
        </div>

        <div className="modal-body">
          <p
            style={{
              marginBottom: '20px',
              color: 'var(--text-muted)'
            }}
          >
            We need to verify your identity against your registered
            face profile before starting the exam timer.
          </p>

          {!modelsLoaded ? (
            <div
              style={{
                padding: '40px',
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              Loading AI Models...
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '3px solid var(--primary)',
                  background: '#000'
                }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    display: 'block'
                  }}
                />
              </div>

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem'
                }}
              >
                {cameraReady
                  ? 'Position your face in the centre of the camera.'
                  : 'Starting camera. Please wait...'}
              </p>
            </div>
          )}

          {failCount >= 2 && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(255,165,0,0.1)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,165,0,0.3)'
              }}
            >
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'orange',
                  margin: 0
                }}
              >
                Multiple verification failures.
                You can re-register your face.
              </p>
            </div>
          )}
        </div>

        <div
          className="modal-footer"
          style={{
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <button
            className="btn btn-ghost"
            onClick={handleCancel}
            disabled={isVerifying}
          >
            Cancel & Go Back
          </button>

          {failCount >= 2 ? (
            <button
              className="btn btn-primary"
              onClick={reRegisterAndVerify}
              disabled={!cameraReady || isVerifying}
              style={{
                background: 'var(--warning, orange)'
              }}
            >
              <FiRefreshCw style={{ marginRight: '8px' }} />
              {isVerifying
                ? 'Re-registering...'
                : 'Re-register & Verify'}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={verifyFace}
              disabled={!cameraReady || isVerifying}
            >
              <FiCamera style={{ marginRight: '8px' }} />
              {isVerifying ? 'Verifying...' : 'Verify My Identity'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceVerificationModal;

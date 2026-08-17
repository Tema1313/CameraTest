import Webcam from 'react-webcam';
import { type CameraOptions, useFaceDetection } from 'react-use-face-detection';
import FaceDetection from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { DISPLAY_SIZE, } from './const';
import { toDisplayCoords } from './utils/toDisplayCoords';

interface IFaceDetectionComponentProps {
    /** Модель face_detection: 'short' или 'full' (по умолчанию 'short') */
    model?: "short" | "full"
    minDetectionConfidence?: number
    height?: number
    width?: number
    size?: number
    facingMode?: "user" | "environment"
    className?: string
    maskStyles?: React.CSSProperties
    /** Максимальное смещение центра лица от центра круга (0..1 от размера экрана) */
    centerTolerance?: number
    onDetectedStateChange?: (detected: boolean) => void
    onError?: (error: string | DOMException) => void
    onCapture?: (image: string) => void
}

const FaceDetectionComponent = ({
    height = 1920,
    width = 1080,
    minDetectionConfidence = 0.9,
    model = "short",
    size = DISPLAY_SIZE,
    facingMode = "user",
    centerTolerance = 0.25,
    className,
    maskStyles,
    onCapture,
    onDetectedStateChange,
    onError
}: IFaceDetectionComponentProps): JSX.Element => {
    const [detected, setDetected] = useState<boolean>(false)
    const capturedRef = useRef(false);

    const { webcamRef, boundingBox } = useFaceDetection({
        faceDetectionOptions: {
            model: model,
            minDetectionConfidence: minDetectionConfidence,
        },
        faceDetection: new FaceDetection.FaceDetection({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
        }),
        camera: ({ mediaSrc, onFrame }: CameraOptions) =>
            new Camera(mediaSrc, {
                onFrame,
                height: height,
                width: width
            }),
    });

    const validFaces = boundingBox.filter((box) => {
        const visualLeft = 1 - (box.xCenter + box.width);
        const visualRight = 1 - box.xCenter;
        const visualTop = box.yCenter;
        const visualBottom = box.yCenter + box.height;

        const topLeft = toDisplayCoords(visualLeft, visualTop);
        const bottomRight = toDisplayCoords(visualRight, visualBottom);

        const dispLeft = topLeft.dx;
        const dispTop = topLeft.dy;
        const dispRight = bottomRight.dx;
        const dispBottom = bottomRight.dy;

        const faceCenterX = (dispLeft + dispRight) / 2;
        const faceCenterY = (dispTop + dispBottom) / 2;
        const circleCenter = size / 2;

        const distance = Math.sqrt(
            Math.pow(faceCenterX - circleCenter, 2) +
            Math.pow(faceCenterY - circleCenter, 2)
        );

        const maxOffset = size * centerTolerance;
        const isCentered = distance <= maxOffset;

        return isCentered;
    });

    const isValid = validFaces.length === 1;

    useEffect(() => {
        setDetected(isValid)
        onDetectedStateChange?.(isValid)

        if (isValid && !capturedRef.current && webcamRef && (webcamRef as any).current) {
            const webCamera: Webcam = (webcamRef! as any).current as Webcam
            capturedRef.current = true;
            const screenshot = webCamera.getScreenshot();
            if (screenshot) {
                onCapture?.(screenshot);
            } else if (!isValid) {
                capturedRef.current = false;
            }
        }
    }, [isValid, webcamRef, onCapture, onDetectedStateChange])

    const handleWebcamError = useCallback((error: string | DOMException) => {
        const err = error instanceof DOMException ? error : error;
        onError?.(err);
    }, [onError])

    return (
        <div style={{ width: size, height: size }} className={className}>
            <Webcam
                audio={false}
                ref={webcamRef}
                forceScreenshotSourceSize
                screenshotFormat="image/jpeg"
                style={{
                    borderRadius: "50%",
                    width: size,
                    height: size,
                    objectFit: "cover",
                    border: detected ? '4px solid green' : '4px solid red',
                    transition: 'border 0.3s ease',
                    ...maskStyles
                }}
                onUserMediaError={handleWebcamError}
                mirrored
                videoConstraints={{
                    facingMode: facingMode,
                    width: { ideal: width, max: width },
                    height: { ideal: height, max: height },
                }}
            />
        </div>
    );
};

export default FaceDetectionComponent;
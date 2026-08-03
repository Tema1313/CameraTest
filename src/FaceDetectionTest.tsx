import Webcam from 'react-webcam';
import { type CameraOptions, useFaceDetection } from 'react-use-face-detection';
import FaceDetection from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import { type JSX } from 'react';

const DISPLAY_SIZE = 300;
const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;

const Y_MIN_VISIBLE = (VIDEO_HEIGHT - VIDEO_WIDTH) / 2 / VIDEO_HEIGHT;
const Y_MAX_VISIBLE = 1 - Y_MIN_VISIBLE;
const VISIBLE_HEIGHT_RATIO = Y_MAX_VISIBLE - Y_MIN_VISIBLE;

const toDisplayCoords = (nx: number, ny: number) => {
    const dx = nx * DISPLAY_SIZE;
    const dy = ((ny - Y_MIN_VISIBLE) / VISIBLE_HEIGHT_RATIO) * DISPLAY_SIZE;
    return { dx, dy };
};

const WebcamDemo = (): JSX.Element => {
    const { webcamRef, boundingBox } = useFaceDetection({
        faceDetectionOptions: {
            model: 'short',
            minDetectionConfidence: 0.9,
        },
        faceDetection: new FaceDetection.FaceDetection({
            locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
        }),
        camera: ({ mediaSrc, onFrame }: CameraOptions) =>
            new Camera(mediaSrc, {
                onFrame,
                height: 1920,
                width: 1080
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
        const circleCenter = DISPLAY_SIZE / 2;

        const distance = Math.sqrt(
            Math.pow(faceCenterX - circleCenter, 2) +
            Math.pow(faceCenterY - circleCenter, 2)
        );

        const maxOffset = DISPLAY_SIZE * 0.25;
        const isCentered = distance <= maxOffset;

        return isCentered;
    });

    const detected = validFaces.length === 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', width: DISPLAY_SIZE, height: DISPLAY_SIZE }}>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    forceScreenshotSourceSize
                    screenshotFormat="image/jpeg"
                    style={{
                        borderRadius: "50%",
                        width: DISPLAY_SIZE,
                        height: DISPLAY_SIZE,
                        objectFit: "cover",
                        border: detected ? '4px solid green' : '4px solid red',
                        transition: 'border 0.3s ease',
                    }}
                    mirrored
                    videoConstraints={{
                        facingMode: "user",
                        width: { ideal: 1080, max: 1080 },
                        height: { ideal: 1920, max: 1920 },
                    }}
                />
            </div>
        </div>
    );
};

export default WebcamDemo;
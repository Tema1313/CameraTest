import Webcam from 'react-webcam';
import { type CameraOptions, useFaceDetection } from 'react-use-face-detection';
import FaceDetection from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import type { JSX } from 'react';

const width = 500;
const height = 500;

// Допуск: лицо считается «полным», если его bbox не выходит за границы кадра
// Можно ужесточить, добавив отступ (margin), чтобы лицо было не вплотную к краю
const MARGIN = 0.05; // 5% от размера кадра

const WebcamDemo = (): JSX.Element => {
    const { webcamRef, boundingBox, isLoading, facesDetected } = useFaceDetection({
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
                width,
                height,
            }),
    });

    // Фильтруем только те лица, чей bounding box полностью внутри кадра
    const fullyVisibleBoxes = boundingBox.filter((box) => {
        const left = box.xCenter;
        const top = box.yCenter;
        const right = box.xCenter + box.width;
        const bottom = box.yCenter + box.height;

        return (
            left >= MARGIN &&
            top >= MARGIN &&
            right <= 1 - MARGIN &&
            bottom <= 1 - MARGIN
        );
    });

    const detected = fullyVisibleBoxes.length > 0;


    return (
        <div>
            <p>{`Loading: ${isLoading}`}</p>
            <p>{`Face Detected: ${detected}`}</p>
            <p>{`Number of faces detected: ${fullyVisibleBoxes.length}`}</p>
            <div style={{ width, height }}>
                <Webcam
                    ref={webcamRef}
                    forceScreenshotSourceSize
                    style={{
                        height,
                        width,
                        position: 'absolute',
                    }}
                />
            </div>
        </div>
    );
};

export default WebcamDemo;
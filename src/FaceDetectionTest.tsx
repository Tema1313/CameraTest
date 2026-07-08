import Webcam from 'react-webcam';
import { type CameraOptions, useFaceDetection } from 'react-use-face-detection';
import FaceDetection from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import type { JSX } from 'react';

const DISPLAY_SIZE = 300;
const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;

// Из-за object-fit: cover видео 1080x1920 вписывается в ширину 300px.
// Его высота становится 533.33px. Контейнер 300x300 обрезает верх и низ.
// Видимая область — это центральный квадрат 1080x1080 от исходного видео.
const Y_MIN_VISIBLE = (VIDEO_HEIGHT - VIDEO_WIDTH) / 2 / VIDEO_HEIGHT; // 420 / 1920 = 0.21875
const Y_MAX_VISIBLE = 1 - Y_MIN_VISIBLE; // 0.78125
const VISIBLE_HEIGHT_RATIO = Y_MAX_VISIBLE - Y_MIN_VISIBLE; // 0.5625

// Функция перевода нормализованных координат видео в координаты экрана 300x300
const toDisplayCoords = (nx: number, ny: number) => {
    const dx = nx * DISPLAY_SIZE;
    // Если ny выходит за пределы видимой области, координата будет < 0 или > 300
    const dy = ((ny - Y_MIN_VISIBLE) / VISIBLE_HEIGHT_RATIO) * DISPLAY_SIZE;
    return { dx, dy };
};

const WebcamDemo = (): JSX.Element => {
    // ВАЖНО: НЕ передаем mirrored: true в useFaceDetection из-за бага в библиотеке.
    // Мы вручную отзеркалим координаты ниже, чтобы они совпадали с <Webcam mirrored={true} />
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
        // В библиотеке box.xCenter — это левая граница (left), а box.yCenter — верхняя (top)

        // 1. Зеркалим координаты X, так как <Webcam mirrored={true} />
        const visualLeft = 1 - (box.xCenter + box.width);
        const visualRight = 1 - box.xCenter;
        const visualTop = box.yCenter;
        const visualBottom = box.yCenter + box.height;

        // 2. Переводим в координаты экрана 300x300
        const topLeft = toDisplayCoords(visualLeft, visualTop);
        const bottomRight = toDisplayCoords(visualRight, visualBottom);

        const dispLeft = topLeft.dx;
        const dispTop = topLeft.dy;
        const dispRight = bottomRight.dx;
        const dispBottom = bottomRight.dy;

        // 3. Лицо должно быть в пределах видимой области кружка (с небольшим допуском 10%)
        const margin = DISPLAY_SIZE * 0.25;
        const isInsideVisibleArea =
            dispLeft >= -margin &&
            dispTop >= -margin &&
            dispRight <= DISPLAY_SIZE + margin &&
            dispBottom <= DISPLAY_SIZE + margin;

        // 4. Для Face-ID лицо должно быть примерно по центру кружка
        const faceCenterX = (dispLeft + dispRight) / 2;
        const faceCenterY = (dispTop + dispBottom) / 2;
        const circleCenter = DISPLAY_SIZE / 2; // 150

        // Расстояние от центра лица до центра кружка
        const distance = Math.sqrt(
            Math.pow(faceCenterX - circleCenter, 2) +
            Math.pow(faceCenterY - circleCenter, 2)
        );

        // Разрешаем отклонение центра лица не более чем на 30% от радиуса (радиус 150, 30% это 45px)
        const maxOffset = DISPLAY_SIZE * 0.3;
        const isCentered = distance <= maxOffset;

        // 5. Лицо должно занимать хотя бы 30% кружка (чтобы пользователь не был слишком далеко)
        // const faceWidth = dispRight - dispLeft;
        // const faceHeight = dispBottom - dispTop;

        return isInsideVisibleArea && isCentered;
    });

    // Для безопасности Face-ID можно требовать, чтобы в кадре было ровно одно лицо
    const detected = validFaces.length === 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <p>{`Face Detected: ${detected}`}</p>
            <p>{`Number of valid faces: ${validFaces.length}`}</p>
            <div style={{ position: 'relative', width: DISPLAY_SIZE, height: DISPLAY_SIZE }}>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    forceScreenshotSourceSize // Отлично, что это есть — для верификации нужно полное фото 1080x1920
                    screenshotFormat="image/jpeg"
                    style={{
                        borderRadius: "50%",
                        width: DISPLAY_SIZE,
                        height: DISPLAY_SIZE,
                        objectFit: "cover",
                        // Визуальная подсветка статуса для пользователя
                        border: detected ? '4px solid green' : '4px solid red',
                        transition: 'border 0.3s ease',
                    }}
                    mirrored={true}
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
import { useRef, useEffect, useState, useMemo } from 'react';
import Webcam from 'react-webcam';
import { type CameraOptions, useFaceDetection } from 'react-use-face-detection';
import FaceDetection from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';
import type { JSX } from 'react';

const MARGIN = 0.05; // 5% отступ от краёв кадра (лицо должно быть полностью видимо)

const WebcamDemo = (): JSX.Element => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 300, height: 300 });

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
                width: 1080,
            }),
    });


    // Обновляем размеры контейнера при монтировании и изменении размера окна
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({ width: rect.width, height: rect.height });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    /**
     * Проверяет, находится ли точка (в нормализованных координатах исходного видео)
     * внутри круга, который отображается на экране.
     * Учитывается object-fit: cover и зеркалирование (mirrored).
     */
    const isPointInsideCircle = (xNorm: number, yNorm: number): boolean => {
        const video = ((webcamRef! as any).current as any).video;
        const container = containerRef.current;
        if (!video || !container) return false;

        // Размеры видео (исходные)
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        // Размеры контейнера (круг)
        const cw = containerSize.width;
        const ch = containerSize.height;

        // Масштаб для object-fit: cover
        const scaleX = cw / vw;
        const scaleY = ch / vh;
        const scale = Math.max(scaleX, scaleY);

        const scaledW = vw * scale;
        const scaledH = vh * scale;
        const offsetX = (cw - scaledW) / 2;
        const offsetY = (ch - scaledH) / 2;

        // Если включено зеркалирование, отражаем координату X
        // (так как MediaPipe выдаёт координаты исходного кадра, а на экране — зеркальное отображение)
        const xMirrored = 1 - xNorm;
        const y = yNorm;

        // Координаты точки в пикселях контейнера
        const px = offsetX + xMirrored * scaledW;
        const py = offsetY + y * scaledH;

        // Центр круга и радиус (круг вписан в контейнер)
        const centerX = cw / 2;
        const centerY = ch / 2;
        const radius = Math.min(cw, ch) / 2;

        const dx = px - centerX;
        const dy = py - centerY;
        return dx * dx + dy * dy <= radius * radius;
    };

    // Фильтруем лица:
    // 1) полностью видимые в кадре (с отступом MARGIN)
    // 2) центр лица попадает в круг
    const validFaces = useMemo(() => {
        return boundingBox.filter((box) => {
            // Проверка полной видимости внутри прямоугольного кадра
            const left = box.xCenter;
            const top = box.yCenter;
            const right = box.xCenter + box.width;
            const bottom = box.yCenter + box.height;
            const fullyVisible =
                left >= MARGIN &&
                top >= MARGIN &&
                right <= 1 - MARGIN &&
                bottom <= 1 - MARGIN;
            if (!fullyVisible) return false;

            // Центр лица в нормализованных координатах
            const cx = box.xCenter + box.width / 2;
            const cy = box.yCenter + box.height / 2;

            return isPointInsideCircle(cx, cy);
        });
    }, [boundingBox, containerSize]);

    const detected = validFaces.length > 0;

    return (
        <div>
            <p>{`Face Detected: ${detected}`}</p>
            <p>{`Number of faces inside circle: ${validFaces.length}`}</p>
            <div ref={containerRef} style={{ width: 300, height: 300 }}>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    forceScreenshotSourceSize
                    screenshotFormat="image/jpeg"
                    style={{
                        borderRadius: '50%',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                    mirrored={true}
                    videoConstraints={{
                        facingMode: 'user',
                        width: { ideal: 1080, max: 1080 },
                        height: { ideal: 1920, max: 1920 },
                    }}
                />
            </div>
        </div>
    );
};

export default WebcamDemo;
import "./App.css";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const downloadFile = (file: File, filename: string): void => {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const defaultDelay = 5;

// Поворачивает изображение (если нужно) и изменяет размер до targetWidth x targetHeight
const rotateAndResizeImage = (
  dataUrl: string,
  targetWidth: number,
  targetHeight: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not available');

      const needRotate = img.width > img.height; // если ландшафт -> повернуть

      if (needRotate) {
        canvas.width = img.height;
        canvas.height = img.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(90 * Math.PI / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      }

      // Финальный canvas с нужными размерами
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) return reject('Final canvas context not available');

      finalCtx.drawImage(
        canvas, 0, 0, canvas.width, canvas.height,
        0, 0, targetWidth, targetHeight
      );
      resolve(finalCanvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
};

function App() {
  const webcamRef = useRef<Webcam | null>(null);
  const [frontCamera, setFrontCamera] = useState<boolean>(true);
  const intervalRef = useRef<number | null>(null);
  const [timer, setTimer] = useState<number>(defaultDelay);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [image, setImage] = useState<string>("");

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          const imageSrc = webcamRef.current?.getScreenshot();
          setImage(imageSrc || "");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startFaceId = async () => {
    console.log(image);
    if (image) {
      let finalDataUrl = image;
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

      if (isMobile) {
        try {
          finalDataUrl = await rotateAndResizeImage(image, 480, 640);
        } catch (err) {
          console.error("Ошибка поворота/масштабирования:", err);
          // в случае ошибки используем исходное изображение
        }
      }

      const blob = await (await fetch(finalDataUrl)).blob();
      const file = new File([blob], "face-capture.jpg", { type: "image/jpeg" });
      downloadFile(file, "");

      setTimeout(() => {
        console.log("Отработал");
        setIsSubmitting(false);
        setTimer(defaultDelay);
      }, 3000);
    }
  };

  useEffect(() => {
    if (timer === 0) {
      startFaceId();
    }
  }, [timer]);

  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

  return (
    <>
      {isSubmitting ? (
        <div>
          {timer !== 0 ? (
            <>
              <div>камера будет работать еще: {timer}</div>
              <Webcam
                className="mt-2"
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{
                  borderRadius: "50%",
                  height: 300,
                  width: 300,
                  objectFit: "cover",
                }}
                mirrored={isMobile ? frontCamera : true}
                onUserMediaError={() => {
                  window.alert("не получили девайсы");
                }}
                videoConstraints={{
                  facingMode: frontCamera ? "user" : "environment",
                  width: 480,
                  height: 640,
                }}
                forceScreenshotSourceSize
              />
            </>
          ) : (
            <span>Обработка...</span>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-2 d-flex align-items-center">
            <button
              className="ms-2 check-label"
              onClick={() => {
                setFrontCamera(!frontCamera);
              }}
            >
              {frontCamera ? "включить переднюю камеру" : "включить фронтальную камеру"}
            </button>
          </div>
          <button
            onClick={() => {
              startTimer();
              setIsSubmitting(true);
            }}
          >
            Сделать запрос
          </button>
          <div>это мобилка: {isMobile ? "Да" : "Нет"}</div>
          <div>{navigator.userAgent}</div>
        </div>
      )}
    </>
  );
}

export default App;
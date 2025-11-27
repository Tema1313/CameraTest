import { useCallback, useEffect, useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Webcam from "react-webcam";

function App() {
  const webcamRef = useRef<Webcam | null>(null);
  const intervalRef = useRef<number | null>(null);

  const capture = useCallback((): void => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      sendToBackend(imageSrc);
    }
  }, [webcamRef]);

  const sendToBackend = async (imageData: string): Promise<void> => {
    // console.log(imageData)
  };

  // Автоматический запуск при монтировании компонента
  useEffect(() => {
    // Запускаем захват сразу и затем каждые 2 секунды
    capture();
    intervalRef.current = setInterval(capture, 2000);

    // Очистка интервала при размонтировании компонента
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [capture]);

  return (
    <div className="d-flex justify-content-center my-3">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{
          borderRadius: "50%",
        }}
        width={300}
        height={300}
        videoConstraints={{
          facingMode: "user",
          width: 300,
          height: 300,
        }}
      />
    </div>
  );
}

export default App;

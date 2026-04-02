// import { useState } from "react";
import "./App.css";
import { useRef, useState } from "react";
import Webcam from "react-webcam"


// const downloadFile = (file: File, filename: string): void => {
//   // Создаем URL для файла
//   const url = URL.createObjectURL(file);

//   // Создаем элемент для скачивания
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;

//   // Добавляем в DOM, кликаем и удаляем
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);

//   // Освобождаем память
//   URL.revokeObjectURL(url);
// };

const defaultDelay = 5

function App() {
  const webcamRef = useRef<Webcam | null>(null)
  const [frontCamera, setFrontCamera] = useState<boolean>(true)
  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const timeoutSeconds = defaultDelay * 1000
  const [timer, setTimer] = useState<number>(defaultDelay)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)


  const startTimer = async () => {
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current!)
      startFaceId()
    }, timeoutSeconds)
  }

  const startFaceId = () => {
    setTimeout(() => {
      // window.alert("Запрос выполнен")
      setIsSubmitting(false)
      setTimer(defaultDelay)
    }, 3000)
  }

  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)

  return (
    <>
      {isSubmitting ?
        <div>
          {timer !== 0 ?
            <>
              <div>камера будет работать еще: {timer}</div>
              <Webcam
                className="mt-2"
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{
                  borderRadius: "50%",
                }}
                mirrored={isMobile
                  ? frontCamera
                  : true}
                width={300}
                height={300}
                onUserMediaError={() => {
                  window.alert("не получили девайсы")
                }}
                videoConstraints={{
                  facingMode: frontCamera ? "user" : "environment",
                  width: 300,
                  height: 300,
                }}
              />
            </>
            :
            <span>Обработка...</span>
          }
        </div>
        :
        <div>
          <div className="mb-2 d-flex align-items-center">
            <button className="ms-2 check-label" onClick={() => {
              setFrontCamera(!frontCamera)
            }}>
              {frontCamera ? "включить переднюю камеру" : "включить фронтальную камеру"}
            </button>
          </div>
          <button onClick={() => {
            startTimer()
            setIsSubmitting(true)
          }}>Сделать запрос</button>
          <div>это мобилка: {isMobile ? "Да" : "Нет"}</div>
          <div>{navigator.userAgent}</div>
        </div>}
      {/* 
      <Webcam
        className="mt-2"
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{
          borderRadius: "50%",
        }}
        mirrored={isMobile
          ? frontCamera
          : true}
        width={300}
        height={300}
        onUserMediaError={() => {
          window.alert("не получили девайсы")
        }}
        videoConstraints={{
          facingMode: frontCamera ? "user" : "environment",
          width: 300,
          height: 300,
        }}
      />
      <div className="mb-2 d-flex align-items-center">
        <button className="ms-2 check-label" onClick={() => {
          setFrontCamera(!frontCamera)
        }}>
          {frontCamera ? "включить переднюю камеру" : "включить фронтальную камеру"}
        </button>
      </div>
      <button>Сделать запрос</button>
      <div>это мобилка: {isMobile ? "Да" : "Нет"}</div>
      <div>{navigator.userAgent}</div> */}
    </>
  );
}

export default App;

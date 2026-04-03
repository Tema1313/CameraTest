import "./App.css";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam"


const downloadFile = (file: File, filename: string): void => {
  // Создаем URL для файла
  const url = URL.createObjectURL(file);

  // Создаем элемент для скачивания
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  // Добавляем в DOM, кликаем и удаляем
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Освобождаем память
  URL.revokeObjectURL(url);
};

// async function urlToFile(url: string, fileName: string, mimeType: string) {
//   const response = await fetch(url);
//   const blob = await response.blob();
//   return new File([blob], fileName, { type: mimeType });
// }

const defaultDelay = 5

function App() {
  const webcamRef = useRef<Webcam | null>(null)
  const [frontCamera, setFrontCamera] = useState<boolean>(true)
  const intervalRef = useRef<number | null>(null)
  const [timer, setTimer] = useState<number>(defaultDelay)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [image, setImage] = useState<string>("")


  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          const imageSrc = webcamRef.current?.getScreenshot()
          setImage(imageSrc || "")
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const startFaceId = async () => {
    console.log(image)
    // if (imageSrc) {
    //   await fetch(imageSrc)
    //     .then((res) => res.blob())
    //     .then(async (blob) => {
    //       const file = new File([blob], "face-capture.jpg", { type: "image/jpeg" })
    //       downloadFile(file, "")
    //     })
    // }
    if (image) {
      await fetch(image)
        .then((res) => res.blob())
        .then(async (blob) => {
          const file = new File([blob], "face-capture.jpg", { type: "image/jpeg" })
          downloadFile(file, "")
        })
      setTimeout(() => {
        console.log("Отработал")
        setIsSubmitting(false)
        setTimer(defaultDelay)
      }, 3000)
    }
  }

  useEffect(() => {
    if (timer === 0) {
      startFaceId()
    }
  }, [timer])

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
            </> :
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
    </>
  );
}

export default App;

import "./App.css";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam"
import { DocumentPdf } from "./PdfDocumentView";
import WebcamDemo from "./FaceDetectionTest";


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

async function urlToFile(url: string, fileName: string, mimeType: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], fileName, { type: mimeType });
}

const compressToLimit = async (
  imageSrc: string,
  maxSizeMB = 1.4
): Promise<Blob> => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  const img = new Image()
  img.src = imageSrc

  await new Promise((resolve) => (img.onload = resolve))

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  canvas.width = img.width
  canvas.height = img.height

  ctx.drawImage(img, 0, 0)

  let quality = 0.9
  let blob: Blob | null = null

  while (quality > 0.1) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    )

    if (blob && blob.size <= maxSizeBytes) {
      return blob
    }

    quality -= 0.1
  }

  return blob!
}

const defaultDelay = 3

function App() {
  // const webcamRef = useRef<Webcam | null>(null)
  // const [frontCamera, setFrontCamera] = useState<boolean>(true)
  // const intervalRef = useRef<number | null>(null)
  // const [timer, setTimer] = useState<number>(defaultDelay)
  // const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  // const [image, setImage] = useState<string>("")


  // const startTimer = () => {
  //   intervalRef.current = setInterval(() => {
  //     setTimer((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(intervalRef.current!)
  //         const imageSrc = webcamRef.current?.getScreenshot()
  //         setImage(imageSrc || "")
  //         return 0
  //       }
  //       return prev - 1
  //     })
  //   }, 1000)
  // }

  // const startFaceId = async () => {
  //   console.log(image)

  //   if (image) {
  //     const blob = await compressToLimit(image, 1.4)

  //     const file = new File([blob], "face-capture.jpg", {
  //       type: "image/jpeg",
  //     })
  //     downloadFile(file, "")
  //     await fetch(image)
  //       .then((res) => res.blob())
  //       .then(async (blob) => {
  //         const file = new File([blob], "face-capture.jpg", { type: "image/jpeg" })
  //         downloadFile(file, "")
  //       })
  //     setTimeout(() => {
  //       console.log("Отработал")
  //       setIsSubmitting(false)
  //       setTimer(defaultDelay)
  //     }, 3000)
  //   }
  // }

  // useEffect(() => {
  //   if (timer === 0) {
  //     startFaceId()
  //   }
  // }, [timer])

  // const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)

  const [count, setCount] = useState<number>(0)
  const checkFaceTimer = useRef<number | null>(null)

  const startTimer = () => {
    checkFaceTimer.current = setTimeout(() => {
      console.log('успешно дошел до конца и выполнился')
    }, 2500)
  }

  useEffect(() => {
    console.log(checkFaceTimer.current)
    if (checkFaceTimer.current) {
      clearTimeout(checkFaceTimer.current)
      checkFaceTimer.current = null
      // startTimer()
    }
  }, [count])

  return (
    <>
      <div>Hello</div>
      {/* <button onClick={() => { startTimer() }}>запустить таймер</button>
      <button onClick={() => {
        setCount(prev => prev + 1)
        console.log('Обновили счетчик')
      }}>обновить счетчик</button>
      <div>счетчик: {count}</div> */}
      {/* <WebcamDemo /> */}
      {/* {isSubmitting ?
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
                  height: 300,
                  width: 300,
                  objectFit: "cover",
                }}
                mirrored={isMobile
                  ? frontCamera
                  : true}
                onUserMediaError={() => {
                  window.alert("не получили девайсы")
                }}
                videoConstraints={{
                  facingMode: frontCamera ? "user" : "environment",
                  width: { ideal: 1080, max: 1080 },
                  height: { ideal: 1920, max: 1920 },
                }}
                forceScreenshotSourceSize
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
          }}>Сделать запрос ого</button>
          <div>это мобилка: {isMobile ? "Да" : "Нет"}</div>
        </div>} */}
    </>
  );
}

export default App;

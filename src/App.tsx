// import { useState } from "react";
import "./App.css";
import { useEffect, useRef, useState } from "react";
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

function App() {
  const webcamRef = useRef<Webcam | null>(null)
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [frontCamera, setFrontCamera] = useState<boolean>(true)


  // const [disabled, setDisabled] = useState<boolean>(false);

  // const takePhoto = async () => {
  //   setDisabled(true);
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: { facingMode: "user" },
  //       audio: false,
  //     });

  //     const video = document.createElement("video");
  //     video.style.display = "none";
  //     video.playsInline = true; // iOS
  //     document.body.appendChild(video);

  //     video.srcObject = stream;
  //     await video.play();

  //     await new Promise<void>((resolve) => {
  //       if (video.readyState >= 2) return resolve();
  //       video.onloadedmetadata = () => resolve();
  //     });

  //     const canvas = document.createElement("canvas");
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;

  //     const ctx = canvas.getContext("2d");
  //     if (!ctx) {
  //       throw new Error("Canvas context is null");
  //     }

  //     ctx.drawImage(video, 0, 0);

  //     const blob = await new Promise<Blob>((resolve, reject) => {
  //       canvas.toBlob(
  //         (b) => {
  //           if (!b) return reject(new Error("Failed to create Blob"));
  //           resolve(b);
  //         },
  //         "image/jpeg",
  //         0.95
  //       );
  //     });

  //     const file = new File([blob], `photo_${Date.now()}.jpg`, {
  //       type: "image/jpeg",
  //       lastModified: Date.now(),
  //     });

  //     downloadFile(file, "A");
  //     stream.getTracks().forEach((t) => t.stop());
  //     setDisabled(false);
  //   } catch (error) {
  //     setDisabled(false);
  //     alert("Ошибка с камерой");
  //   }
  // };
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videos = devices.filter((d) => d.kind === "videoinput")
      setVideoDevices(videos)
    })

  }, [])

  return (
    <>
      update
      <Webcam
        className="mt-2"
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{
          borderRadius: "50%",
        }}
        mirrored={videoDevices.length <= 1 ? true : frontCamera}
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
        <button className="ms-2 check-label" onClick={()=>{
          setFrontCamera(!frontCamera)
        }}>
          {frontCamera ? "включить переднюю камеру" : "включить фронтальную камеру"}
        </button>
      </div>
      {/* {disabled ? (
        <div>Загрузка</div>
      ) : (
        <button
          onClick={() => {
            takePhoto();
          }}
        >
          Войти по Face-Id
        </button>
      )} */}
    </>
  );
}

export default App;

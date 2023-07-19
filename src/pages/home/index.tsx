import { HomeContainer } from "./indexElements";
import Classifier from "../classifier";
import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import SavePopup from "../../components/body/save_popup";
import UploadPopup from "../../components/body/upload_image";
import { saveAs } from "file-saver";
import ImageAnnotation from "../../components/body/image_annotation";

interface ImageCache {
  label: string;
  src: string;
  confidence: number;
  prediction: string;
  region: Array<number>;
  annotated: boolean;
}

// set up eslint
// parse json file
// set up authentification, talk to leron
// look into azure storage api

const Home = () => {
  const [captureEmpty, setCaptureEmpty] = useState<boolean>(true);
  const [imageSrc, setImageSrc] = useState<string>(
    "https://roadmap-tech.com/wp-content/uploads/2019/04/placeholder-image.jpg"
  );
  const [imageFormat, setImageFormat] = useState<string>("image/png");
  const [imageLabel, setImageLabel] = useState<string>("");
  const [annotationEmpty, setAnnotationEmpty] = useState<boolean>(true);
  const [saveOpen, setSaveOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [annotationOpen, setAnnotationOpen] = useState<boolean>(false);
  const [imageCount, setImageCount] = useState<number>(1);
  const [imageCache, setImageCache] = useState<ImageCache[]>([]);
  const [inferenceData, setInferenceData] = useState<any>([]);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cache_image = (
    label: string,
    src: string,
    confidence: number,
    prediction: string,
    region: Array<number>,
    annotated: boolean
  ) => {
    setImageCount((imageCount) => imageCount + 1);
    setImageCache((prevCache) => [
      ...prevCache,
      {
        label: label,
        src: src,
        confidence: confidence,
        prediction: prediction,
        region: region,
        annotated: annotated,
      },
    ]);
  };

  const capture = () => {
    const src = webcamRef.current!.getScreenshot();
    setImageSrc(src!);
    setCaptureEmpty(false);
    cache_image(`Capture: ${imageCount}`, src!, 0, "", [], false);
  };

  const upload_image = (event: any) => {
    event.preventDefault();
    const src = URL.createObjectURL(event.target.files[0]);
    setImageSrc(src);
    cache_image(`Capture: ${imageCount}`, src!, 0, "", [], false);
    setUploadOpen(false);
    setCaptureEmpty(false);
  };

  const load_from_cache = (event: any) => {
    event.preventDefault();
    const src = event.target.getAttribute("data-value");
    setImageSrc(src);
    setCaptureEmpty(false);
  };

  const check_cache_empty = () => {
    if (imageCache.length === 1) {
      setImageSrc(
        "https://roadmap-tech.com/wp-content/uploads/2019/04/placeholder-image.jpg"
      );
      setCaptureEmpty(true);
      setImageLabel("");
      return true;
    } else {
      return false;
    }
  };

  const remove_image = (event: any) => {
    event.preventDefault();
    const src = event.target.getAttribute("data-value");
    const newCache = imageCache.filter((item) => item.src !== src);
    setImageCache(newCache);
    setImageCount((imageCount) => imageCount - 1);
    if (newCache.length > 0) {
      setImageSrc(newCache[newCache.length - 1].src);
    }
    check_cache_empty();
  };

  const clear_capture = () => {
    const newCache = imageCache.filter((item) => item.src !== imageSrc);
    setImageCache(newCache);
    setImageCount((imageCount) => imageCount - 1);
    if (newCache.length > 0) {
      setImageSrc(newCache[newCache.length - 1].src);
    }
    check_cache_empty();
  };

  const clear_cache = () => {
    setImageSrc(
      "https://roadmap-tech.com/wp-content/uploads/2019/04/placeholder-image.jpg"
    );
    setCaptureEmpty(true);
    setImageLabel("");
    setImageCache([]);
    setImageCount(1);
    check_cache_empty();
  };

  const save_image = () => {
    saveAs(
      imageSrc,
      `${imageLabel}-${new Date().getFullYear()}-${
        new Date().getMonth() + 1
      }-${new Date().getDate()}.${imageFormat.split("/")[1]}`
    );
    setSaveOpen!(false);
  };

  const handleFormat = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setImageFormat(event.target.value);
  };

  const handleLabel = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageLabel(event.target.value);
  };

  const handle_inference_request = () => {
    fetch("./sim.json")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setInferenceData((prevData: any) => [...prevData, data]);
      })
      .catch((e: Error) => {
        console.log(e.message);
      });

    console.log(inferenceData);

    let region = [100, 100, 100, 100];
    let prediction = "Canola";
    let confidence = 0.9;
    imageCache.forEach((item) => {
      if (item.src === imageSrc) {
        item.confidence = confidence;
        item.prediction = prediction;
        item.region = region;
        item.annotated = true;
      }
    });
    load_to_canvas();
  };

  const load_to_canvas = () => {
    const image = new Image();
    image.src = imageSrc;
    const canvas = canvasRef.current;
    const ctx = canvas!.getContext("2d");
    image.onload = () => {
      canvas!.width = image.width;
      canvas!.height = image.height;
      ctx!.drawImage(image, 0, 0);
      imageCache.forEach((item) => {
        if (item.src === imageSrc && item.annotated === true) {
          ctx!.font = "20px Arial";
          ctx!.fillStyle = "red";
          ctx!.fillText(
            item.prediction,
            item.region[0] - 2,
            item.region[1] - 5
          );
          ctx!.lineWidth = 3;
          ctx!.setLineDash([5, 5]);
          ctx!.strokeStyle = "red";
          // iterate through region array and draw rectanlges on canvas
          ctx!.rect(
            item.region[0],
            item.region[1],
            item.region[2],
            item.region[3]
          );
        }
        if (item.src === imageSrc) {
          ctx!.font = "25px Arial";
          ctx!.fillStyle = "white";
          ctx!.fillText(item.label, 10, canvas!.height - 15);
        }
        ctx!.stroke();
      });
    };
  };

  useEffect(() => {
    load_to_canvas();
  }, [imageSrc]);

  return (
    <HomeContainer>
      {saveOpen === true && (
        <SavePopup
          saveOpen={saveOpen}
          setSaveOpen={setSaveOpen}
          saveImage={save_image}
          imageFormat={imageFormat}
          imageLabel={imageLabel}
          setImageFormat={setImageFormat}
          setImageLabel={setImageLabel}
          handleFormat={handleFormat}
          handleLabel={handleLabel}
        />
      )}
      {uploadOpen === true && (
        <UploadPopup
          setImageSrc={setImageSrc}
          capture={capture}
          uploadOpen={uploadOpen}
          setUploadOpen={setUploadOpen}
          uploadImage={upload_image}
        />
      )}
      {annotationOpen === true && (
        <ImageAnnotation
          imageSrc={imageSrc}
          annotationOpen={annotationOpen}
          setAnnotationOpen={setAnnotationOpen}
        />
      )}
      <Classifier
        captureEmpty={captureEmpty}
        handleInference={handle_inference_request}
        uploadOpen={uploadOpen}
        setUploadOpen={setUploadOpen}
        setCaptureEmpty={setCaptureEmpty}
        imageSrc={imageSrc}
        setImageSrc={setImageSrc}
        webcamRef={webcamRef}
        imageFormat={imageFormat}
        setImageFormat={setImageFormat}
        imageLabel={imageLabel}
        setImageLabel={setImageLabel}
        annotationEmpty={annotationEmpty}
        setAnnotationEmpty={setAnnotationEmpty}
        saveOpen={saveOpen}
        setSaveOpen={setSaveOpen}
        clear={clear_capture}
        capture={capture}
        saveImage={save_image}
        annotationOpen={annotationOpen}
        setAnnotationOpen={setAnnotationOpen}
        savedImages={imageCache}
        clearImageCache={clear_cache}
        loadImage={load_from_cache}
        canvasRef={canvasRef}
        removeImage={remove_image}
      />
    </HomeContainer>
  );
};

export default Home;

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/PreviewMap.module.css";
import mapPreviewImage from "../../assets/UserInput.jpg"; 
import { useUser } from "../../context/UserContext";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const PreviewPage = () => {
  const {
    token,
    setOriginalImageDimensions,
    setOriginalImageUrl,
    setOriginalImageData,
    email,
    setGeneratedImage,
  } = useUser();
  const navigate = useNavigate();
  const [mapName, setMapName] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isFileSaved, setIsFileSaved] = useState(false);
  const [maskImageUrl, setMaskImageUrl] = useState(null);
  const imageRef = useRef(null);
  const [imageDownloaded, setImageDownloaded] = useState(false);

  useEffect(() => {
    const blobUrl = sessionStorage.getItem("maskBlobUrl");

    if (blobUrl) {
      fetch(blobUrl)
        .then((response) => response.blob())
        .then((imageBlob) => {
          const imageUrl = URL.createObjectURL(imageBlob);
          const img = new Image();
          img.src = imageUrl;

          setOriginalImageData(imageBlob);
          setOriginalImageUrl(imageUrl);
          setGeneratedImage(imageBlob); // Set generatedImage in context

          img.onload = () => {
            setOriginalImageDimensions({
              width: img.width,
              height: img.height,
            });

            setMaskImageUrl(imageUrl);

            if (!imageDownloaded) {
              downloadImage(imageBlob);
              setImageDownloaded(true);
            }
          };
        })
        .catch((error) => {
          console.error("Error fetching the image from sessionStorage:", error);
        });
    } else {
      console.error("No image URL found in sessionStorage.");
    }
  }, [
    setOriginalImageDimensions,
    setOriginalImageUrl,
    setOriginalImageData,
    setGeneratedImage,
    imageDownloaded,
  ]);

  const downloadImage = (blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "downloaded_image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveImage = async () => {
    if (mapName.trim() === "") {
      setPopupMessage("Please enter the file name first.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } else {
      try {
        // Fetch the image blob from maskImageUrl
        const response = await fetch(maskImageUrl);
        if (!response.ok) throw new Error("Failed to fetch image");

        const imageBlob = await response.blob();
        const imageFile = new File([imageBlob], `${mapName}.png`, {
          type: "image/png",
        });

        // Create form data
        const formData = new FormData();
        formData.append("name", mapName);
        formData.append("image", imageFile);
        formData.append("type", "generatedImage"); // Set the image type
        formData.append("userEmail", email);

        // Post the form data to the backend using Axios
        const uploadResponse = await axios.post(
          "http://localhost:5000/api/images/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`, // Ensure token is available
            },
          }
        );

        // Handle the successful response
        console.log("Image uploaded successfully:", uploadResponse.data);
        setIsFileSaved(true);
        setPopupMessage("File Saved!");
      } catch (error) {
        // Catch both fetch and axios errors
        console.error(
          "Error uploading image:",
          error.response?.data || error.message
        );
        setPopupMessage("Error saving the file");
      }

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }
  };

  const handleRegenerate = () => {
    navigate("/regenerate");
  };

  const handleDetection = () => {
    navigate("/rooftop");
  };

  return (
    <div className={styles.previewContainer}>
      <div className={styles.content}>
        <h1 className={styles.previewTitle}>Preview Map</h1>

        {/* TransformWrapper for Zoom, Pan, and Pinch functionality */}
        <TransformWrapper initialScale={1}>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className={styles.mapPreview}>
                <TransformComponent>
                  {maskImageUrl ? (
                    <img
                      src={maskImageUrl}
                      alt="Map Preview"
                      className={styles.mapImage}
                      ref={imageRef}
                      style={{
                        width: "100%",
                        height: "auto",
                      }}
                    />
                  ) : (
                    <img
                      src={mapPreviewImage}
                      alt="Map Preview"
                      className={styles.mapImage}
                      style={{
                        width: "100%",
                        height: "auto",
                      }}
                    />
                  )}
                </TransformComponent>
              </div>

              {/* Updated horizontal control buttons */}
              <div className={styles.horizontalControls}>
                <button onClick={() => zoomIn()} className={styles.zoomButton}>
                  Zoom In
                </button>
                <button onClick={() => zoomOut()} className={styles.zoomButton}>
                  Zoom Out
                </button>
                <button
                  onClick={() => resetTransform()}
                  className={styles.zoomButton}
                >
                  Reset
                </button>
                <input
                  type="text"
                  placeholder="Enter map name"
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  className={styles.mapNameInput}
                />
                <button onClick={handleSaveImage} className={styles.saveButton}>
                  Save Image
                </button>
                <button
                  onClick={handleRegenerate}
                  className={styles.regenerateButton}
                >
                  Regenerate
                </button>
                <button
                  onClick={handleDetection}
                  className={styles.regenerateButton}
                  disabled={!isFileSaved} // Disable until file is saved
                >
                  Detect
                </button>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>

      {showPopup && <div className={styles.popup}>{popupMessage}</div>}
    </div>
  );
};

export default PreviewPage;

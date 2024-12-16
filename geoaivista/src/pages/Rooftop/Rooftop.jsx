// import { useState, useEffect } from "react";
// import axios from "axios"; 
// import { useUser } from "../../context/UserContext";
// import { useNavigate } from "react-router-dom";
// import styles from "../../styles/Rooftop.module.css";

// const RooftopPage = () => {
//   const { generatedImage, setGeneratedImage } = useUser();
//   const navigate = useNavigate();
//   const [imageUrl, setImageUrl] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isProcessingDone, setIsProcessingDone] = useState(false); 
//   const [totalHousesDetected, setTotalHousesDetected] = useState(null);
//   const [confidenceUsed, setConfidenceUsed] = useState(null);

//   useEffect(() => {
//     if (!generatedImage) {
//       console.error("No generated image available.");
//       return;
//     }

//     // Display the initially uploaded/generated image
//     const url = URL.createObjectURL(generatedImage);
//     setImageUrl(url);

//     return () => {
//       URL.revokeObjectURL(url);
//     };
//   }, [generatedImage]);

//   const handleRooftopDetection = async () => { 
//     if (!generatedImage) {
//       console.error("No generated image available for rooftop detection.");
//       return;
//     }

//     setIsLoading(true);
//     setIsProcessingDone(false);

//     try {
//       // Prepare the image as form data
//       const formData = new FormData();
//       formData.append("file", generatedImage, "input_map.png");

//       // Send the image to the FastAPI endpoint for rooftop detection
//       const response = await axios.post(
//         "http://localhost:8000/process",
//         formData,
//         {
//           responseType: "json" 
//         }
//       );

//       if (response) {
//         console.log("response data:", response.data);

//         // Destructure the fields from the response
//         const { total_houses_detected, confidence_used, processed_image_url } = response.data;

//         // Set the values in state
//         setTotalHousesDetected(total_houses_detected);
//         setConfidenceUsed(confidence_used);

//         // Fetch the processed image
//         const processedImageResponse = await axios.get(
//           `http://localhost:8000${processed_image_url}`,
//           { responseType: "blob" }
//         );

//         const processedBlob = processedImageResponse.data;
//         const processedImageUrlObj = URL.createObjectURL(processedBlob);

//         // Update the display with the processed image
//         setImageUrl(processedImageUrlObj);
//         setGeneratedImage(processedBlob);  
//         setIsProcessingDone(true);
//       } else {
//         console.error("Unexpected response:", response);
//       }
//     } catch (error) {
//       console.error("Error detecting rooftops:", error.response?.data || error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleUpscale = () => {
//     navigate("/home");
//   };

//   return (
//     <div className={styles.background}>
//       <div className={styles.formContainer}>
//         <h1 className={styles.title}>Rooftop Detection</h1>

//         <div className={styles.imageEditor}>
//           {imageUrl ? (
//             <img 
//               src={imageUrl}
//               alt="Generated Map"
//               className={styles.mapImage}
//               style={{
//                 width: "100%",
//                 height: "auto",
//                 maxWidth: "600px"
//               }}
//             />
//           ) : (
//             <p>Loading image...</p>
//           )}
//         </div>

//         {!isProcessingDone && (
//           <button className={styles.submitButton} onClick={handleRooftopDetection}>
//             Detect Rooftops
//           </button>
//         )}
// {isProcessingDone && (
//   <div className={styles.detailsContainer}>
//     <div className={styles.topDetails}>
//       <p className={styles.detailsText}>
//         <strong>Total Houses Detected:</strong> {totalHousesDetected}
//       </p>
//       <p className={styles.detailsText}>
//         <strong>Confidence Used:</strong> {confidenceUsed}
//       </p>
//     </div>

//     <div className={styles.bottomActions}>
//       <button className={styles.detailsButton} onClick={handleUpscale}>
//         Done
//       </button>
//     </div>
//   </div>
// )}



//         {isLoading && (
//           <div className={styles.loadingOverlay}>
//             <div className={styles.loadingSpinner}></div>
//             <p className={styles.loadingText}>Detecting rooftops...</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RooftopPage;

import { useState, useEffect } from "react";
import axios from "axios"; 
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Rooftop.module.css";

const RooftopPage = () => {
  const { generatedImage, setGeneratedImage } = useUser();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingDone, setIsProcessingDone] = useState(false); 
  const [totalHousesDetected, setTotalHousesDetected] = useState(null);
  const [confidenceUsed, setConfidenceUsed] = useState(null);
  const [confidence, setConfidence] = useState(5.0); // default confidence

  useEffect(() => {
    if (!generatedImage) {
      console.error("No generated image available.");
      return;
    }

    // Display the initially uploaded/generated image
    const url = URL.createObjectURL(generatedImage);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [generatedImage]);

  const handleRooftopDetection = async () => { 
    if (!generatedImage) {
      console.error("No generated image available for rooftop detection.");
      return;
    }

    setIsLoading(true);
    setIsProcessingDone(false);

    try {
      // Prepare the image as form data
      const formData = new FormData();
      formData.append("file", generatedImage, "input_map.png");
      formData.append("confidence", confidence.toString());

      // Send the image and confidence to the FastAPI endpoint for rooftop detection
      const response = await axios.post(
        "http://localhost:8000/process",
        formData,
        {
          responseType: "json" 
        }
      );

      if (response) {
        console.log("response data:", response.data);

        // Destructure the fields from the response
        const { total_houses_detected, confidence_used, processed_image_url } = response.data;

        // Set the values in state
        setTotalHousesDetected(total_houses_detected);
        setConfidenceUsed(confidence_used);

        // Fetch the processed image
        const processedImageResponse = await axios.get(
          `http://localhost:8000${processed_image_url}`,
          { responseType: "blob" }
        );

        const processedBlob = processedImageResponse.data;
        const processedImageUrlObj = URL.createObjectURL(processedBlob);

        // Update the display with the processed image
        setImageUrl(processedImageUrlObj);
        setGeneratedImage(processedBlob);  
        setIsProcessingDone(true);
      } else {
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Error detecting rooftops:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpscale = () => {
    navigate("/home");
  };

  return (
    <div className={styles.background}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Rooftop Detection</h1>

        <div className={styles.imageEditor}>
          {imageUrl ? (
            <img 
              src={imageUrl}
              alt="Generated Map"
              className={styles.mapImage}
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "600px"
              }}
            />
          ) : (
            <p>Loading image...</p>
          )}
        </div>

        {/* If not processed yet, show the confidence input and Detect button */}
        {!isProcessingDone && (
          <div className={styles.inputContainer}>
            <label htmlFor="confidence" className={styles.label}>Confidence:</label>
            <input
              id="confidence"
              type="number"
              step="0.1"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className={styles.confidenceInput}
            />
            <button className={styles.submitButton} onClick={handleRooftopDetection}>
              Detect Rooftops
            </button>
          </div>
        )}

        {isProcessingDone && (
          <div className={styles.detailsContainer}>
            <div className={styles.topDetails}>
              <p className={styles.detailsText}>
                <strong>Total Houses Detected:</strong> {totalHousesDetected}
              </p>
              <p className={styles.detailsText}>
                <strong>Confidence Used:</strong> {confidenceUsed}
              </p>
            </div>

            <div className={styles.bottomActions}>
              <button className={styles.detailsButton} onClick={handleUpscale}>
                Done
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Detecting rooftops...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RooftopPage;


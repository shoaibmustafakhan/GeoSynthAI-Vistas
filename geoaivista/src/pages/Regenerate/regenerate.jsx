import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import{useNavigate }from "react-router-dom"; // Import useNavigate
import {
  faUndoAlt,
  faPalette,
  faBrush,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Line, Circle } from "react-konva";
import axios from "axios"; // Axios for sending images to the backend
import { useUser } from "../../context/UserContext"; // Import useUser
import styles from "../../styles/RequirementForm.module.css";

const RegeneratePage = () => {
  const [tool, setTool] = useState(""); // 'marker', 'pin', or ''
  const [isOperationActive, setIsOperationActive] = useState(false);
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);
  const [actions, setActions] = useState([]);
  const [brushColor, setBrushColor] = useState("rgba(0, 0, 0, 0.5)");
  const [brushSize, setBrushSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const isDrawing = useRef(false);
  const stageRef = useRef(null);
  const invisibleLayerRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Get generatedImage and its setter from context
  const { generatedImage, setGeneratedImage } = useUser();
  const navigate = useNavigate(); // Initialize the useNavigate hook
  useEffect(() => {
    if (generatedImage) {
      const imageUrl = URL.createObjectURL(generatedImage);
      const img = new window.Image();
      img.src = imageUrl;

      img.onload = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxWidth = viewportWidth * 0.6; // 80% of the viewport width
        const maxHeight = viewportHeight * 0.6; // 80% of the viewport height

        let scale = 1;
        if (img.width > maxWidth || img.height > maxHeight) {
          const widthScale = maxWidth / img.width;
          const heightScale = maxHeight / img.height;
          scale = Math.min(widthScale, heightScale); // Maintain aspect ratio
        }

        setImage(img);
        setImageDimensions({
          width: img.width * scale,
          height: img.height * scale,
        });
      };
    } else {
      console.error("No generated image available in context.");
    }
  }, [generatedImage]);

  // Helper function to convert dataURL to Blob
  const dataURLToBlob = (dataURL) => {
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const buffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(buffer);

    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([buffer], { type: mimeString });
  };

  // Function to handle tool selection
  const handleToolSelect = (selectedTool) => {
    setTool(selectedTool);
    setIsOperationActive(true);
  };

  // Function to finish the current operation
  const finishOperation = () => {
    setIsOperationActive(false);
    setTool("");
    isDrawing.current = false;
  };

  // Mouse down event handler
  const handleMouseDown = (e) => {
    if (!isOperationActive) return;

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    if (tool === "pin") {
      setPoints((prevPoints) => {
        const updatedPoints = [...prevPoints, pointerPosition];
        setActions((prevActions) => [
          ...prevActions,
          { type: "pin", points: updatedPoints },
        ]);
        return updatedPoints;
      });
    } else if (tool === "marker") {
      isDrawing.current = true;
      const newLine = [pointerPosition];
      setLines((prevLines) => [...prevLines, newLine]);
      setActions((prevActions) => [
        ...prevActions,
        { type: "marker", lines: [...lines, newLine] },
      ]);
    }
  };

  // Mouse move event handler
  const handleMouseMove = (e) => {
    if (!isDrawing.current || tool !== "marker") return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    const lastLine = lines[lines.length - 1];
    lastLine.push(point);
    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);

    // Update actions for undo functionality
    const updatedActions = [...actions];
    updatedActions[updatedActions.length - 1].lines = [...lines];
    setActions(updatedActions);
  };

  // Mouse up event handler
  const handleMouseUp = () => {
    if (tool === "marker") {
      isDrawing.current = false;
    }
  };

  // Undo the last actionnnnnn
  const handleUndo = () => {
    if (actions.length === 0) return;

    const lastAction = actions[actions.length - 1];
    if (lastAction.type === "pin") {
      setPoints((prevPoints) => prevPoints.slice(0, -1));
    } else if (lastAction.type === "marker") {
      setLines((prevLines) => prevLines.slice(0, -1));
    }

    setActions((prevActions) => prevActions.slice(0, -1));

    // If no actions are left, operation is no longer active
    if (actions.length <= 1) {
      setIsOperationActive(false);
      setTool("");
    }
  };

  const handleRegenerate = async () => {
    if (!generatedImage) {
      console.error("No generated image available for regeneration.");
      return;
    }
  
    setIsLoading(true); // Show loading indicator
  
    const invisibleLayer = invisibleLayerRef.current.toDataURL();
    const maskBlob = dataURLToBlob(invisibleLayer);
    const formData = new FormData();
    formData.append("mask", maskBlob, "mask.png");
    formData.append("image", generatedImage, "generatedImage.png");
  
    try {
      const response = await axios.post(
        "http://localhost:5006/inpaint",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );
  
      const newGeneratedImageBlob = response.data;
  
      // Update context
      setGeneratedImage(newGeneratedImageBlob);
  
      // Remove old URL and set new URL in session storage
      sessionStorage.removeItem("maskBlobUrl");
      const newBlobUrl = URL.createObjectURL(newGeneratedImageBlob);
      sessionStorage.setItem("maskBlobUrl", newBlobUrl);
  
      navigate("/preview"); // Navigate to the preview page
    } catch (error) {
      console.error("Error uploading files.", error);
    }
  
    setIsLoading(false); // Hide loading indicator
  };
  
  
  return (
    <div className={styles.background}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Regenerate Your Image</h1>
        <p className={styles.subtitle}>Edit the generated image here</p>

        <div className={styles.imageEditor}>
          {image ? (
            <div className={styles.editorContent}>
              {/* Left Panel: Toolbar and Canvas */}
              <div className={styles.leftPanel}>
                {/* Toolbar */}
                <div className={styles.toolbar}>
                  {/* Undo Button */}
                  <button
                    className={`${styles.toolbarBtn}`}
                    onClick={handleUndo}
                    disabled={!isOperationActive}
                  >
                    <FontAwesomeIcon icon={faUndoAlt} className="undo-icon" />
                    Undo
                  </button>

                  {/* Button for Marker */}
                  <button
                    className={`${styles.toolbarBtn}`}
                    onClick={() => handleToolSelect("marker")}
                    disabled={isOperationActive && tool !== "marker"}
                  >
                    Use Marker
                  </button>

                  {/* Button for Pinning Points */}
                  <button
                    className={`${styles.toolbarBtn}`}
                    onClick={() => handleToolSelect("pin")}
                    disabled={isOperationActive && tool !== "pin"}
                  >
                    Pin Points
                  </button>

                  {/* Finish Operation Button */}
                  {isOperationActive && (
                    <button
                      className={`${styles.toolbarBtn} ${styles.finishButton}`}
                      onClick={finishOperation}
                    >
                      Finish
                    </button>
                  )}
                </div>

                {/* Canvas Container */}
                <div className={styles.canvasContainer}>
                  <Stage
                    ref={stageRef}
                    width={imageDimensions.width}
                    height={imageDimensions.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    {/* Invisible Layer for Masking */}
                    <Layer ref={invisibleLayerRef}>
                      {/* Invisible lines for marker tool */}
                      {lines.map((line, i) => (
                        <Line
                          key={i}
                          points={line.flatMap((point) => [point.x, point.y])}
                          stroke="white"
                          strokeWidth={brushSize}
                          tension={0.5}
                          lineCap="round"
                          globalCompositeOperation="source-over"
                        />
                      ))}

                      {/* Invisible shape for pinning tool */}
                      {points.length > 1 && (
                        <Line
                          points={points.flatMap((p) => [p.x, p.y])}
                          stroke="white"
                          strokeWidth={brushSize}
                          closed={true}
                          fill="white"
                          lineCap="round"
                          lineJoin="round"
                        />
                      )}
                    </Layer>

                    {/* Visible Layer */}
                    <Layer>
                      {image && (
                        <KonvaImage
                          image={image}
                          width={imageDimensions.width}
                          height={imageDimensions.height}
                        />
                      )}

                      {/* Render pinned points */}
                      {points.map((point, index) => (
                        <Circle
                          key={index}
                          x={point.x}
                          y={point.y}
                          radius={5}
                          fill="black"
                        />
                      ))}

                      {/* Draw lines connecting pinned points */}
                      {points.length > 1 && (
                        <Line
                          points={points.flatMap((p) => [p.x, p.y])}
                          stroke="black"
                          strokeWidth={2}
                          closed={false}
                          lineCap="round"
                          lineJoin="round"
                        />
                      )}

                      {/* Brush drawing lines */}
                      {lines.map((line, i) => (
                        <Line
                          key={i}
                          points={line.flatMap((point) => [point.x, point.y])}
                          stroke={brushColor}
                          strokeWidth={brushSize}
                          tension={0.5}
                          lineCap="round"
                          globalCompositeOperation="source-over"
                        />
                      ))}
                    </Layer>
                  </Stage>
                </div>
              </div>

              {/* Sidebar: Brush Settings */}
              <div
                className={`${styles.sidebar} ${
                  tool === "marker" ? "" : styles.sidebarOpen
                }`}
              >
                {/* Close Button */}
                <button
                  className={styles.closeButton}
                  onClick={finishOperation}
                >
                  &times;
                </button>
                {tool === "marker" && (
                  <div className={styles.brushSettings}>
                    <h3>Brush Settings</h3>
                    <label>
                      <FontAwesomeIcon
                        icon={faPalette}
                        className={styles.icon}
                      />{" "}
                      Brush Color:
                    </label>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                    />
                    <label>
                      <FontAwesomeIcon icon={faBrush} className={styles.icon} />{" "}
                      Brush Size:
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p>Loading image...</p>
          )}
        </div>

        {/* Regenerate Button at the Bottom */}
        <button className={styles.submitButton} onClick={handleRegenerate}>
          Regenerate
        </button>

        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>Regenerating the image...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegeneratePage;

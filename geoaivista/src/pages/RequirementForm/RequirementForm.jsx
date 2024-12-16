import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUndoAlt,
  faPalette,
  faBrush,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { Stage, Layer, Image as KonvaImage, Line, Circle } from "react-konva";
import styles from "../../styles/RequirementForm.module.css";

const RequirementForm = () => {
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
  const navigate = useNavigate();
  const { uploadedImage, setInvisibleLayer } = useUser();
  const [image, setImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  // eslint-disable-next-line no-unused-vars
  const [scaleFactor, setScaleFactor] = useState(1);

  // Load the uploaded image into an Image object
  useEffect(() => {
    if (uploadedImage) {
      const img = new window.Image();
      img.src = URL.createObjectURL(uploadedImage);
      img.onload = () => {
        const maxWidth = 800; // maximum width for the image
        let scale = 1;
        if (img.width > maxWidth) {
          scale = maxWidth / img.width;
        }
        setImage(img);
        setImageDimensions({
          width: img.width * scale,
          height: img.height * scale,
        });
        setScaleFactor(scale);
      };
    }
  }, [uploadedImage]);

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
      // Add a point
      setPoints((prevPoints) => {
        const updatedPoints = [...prevPoints, pointerPosition];
        setActions((prevActions) => [
          ...prevActions,
          { type: "pin", points: updatedPoints },
        ]);
        return updatedPoints;
      });
    } else if (tool === "marker") {
      // Start drawing
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
      // Operation remains active until user clicks "Finish"
    }
  };

  // Undo the last action
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

  // Function to handle form submission
  const handleSubmit = async () => {
    setIsLoading(true); // Show loading indicator

    const invisibleLayer = invisibleLayerRef.current.toDataURL();
    setInvisibleLayer(invisibleLayer);

    // Download the masked image
    downloadMaskedImage(invisibleLayer);

    // Convert dataURL to Blob
    const maskBlob = dataURLToBlob(invisibleLayer);
    const formData = new FormData();
    formData.append("image", uploadedImage);
    formData.append("mask", maskBlob, "mask.png");

    try {
      const response = await axios.post(
        "http://localhost:5006/inpaint",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );
      const maskBlob = response.data;
      const blobUrl = URL.createObjectURL(maskBlob);
      sessionStorage.setItem("maskBlobUrl", blobUrl);

      console.log("Files uploaded successfully!", response.data);
    } catch (error) {
      console.error("Error uploading files.", error);
    }

    // Wait for 5 seconds before navigating
    setTimeout(() => {
      setIsLoading(false); // Hide loading indicator
      navigate("/preview");
    }, 5000);
  };

  // Function to download the masked image
  const downloadMaskedImage = (dataURL) => {
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "maskedImage.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  return (
    <div className={styles.background}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Land</h1>
        <p className={styles.subtitle}>Edit your Image Here</p>

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
            <p>No image uploaded</p>
          )}
        </div>

        <button className={styles.submitButton} onClick={handleSubmit}>
          Submit
        </button>

        {/* Loading Indicator */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner}></div>
            <p className={styles.loadingText}>
              Please wait while we are generating your map...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequirementForm;

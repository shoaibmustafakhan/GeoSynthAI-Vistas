import { useState } from "react";
import { Container, Form, FormGroup, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Home.module.css";
import { useUser } from "../../context/UserContext";

const Home = () => {
  const { token, setToken, setLoggedIn } = useUser();
  const [image, setImage] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  const { setUploadedImage } = useUser(); // Add this line to access setUploadedImage from context

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setUploadedImage(e.target.files[0]); // Set the uploaded image globally in the context
    setAlertMessage(""); // Clear alert message on new file select
  };

  const handleRemoveImg = () => {
    setImage(null);
    window.location.reload();
  };

  const handleUpload = async () => {
    if (image) {
      const fileType = image.type;
      if (fileType !== "image/jpeg" && fileType !== "image/png") {
        setAlertMessage("Wrong File Type! Please upload a PNG image.");
        return;
      }

      try {
        if (!token) throw new Error("No token found");

        const formData = new FormData();
        formData.append("image", image); // Append the image to FormData
        formData.append("name", formData.name);

        const response = await fetch("http://localhost:5000/api/images", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Include token in headers
          },
          body: formData, // Pass FormData object as body
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setUploadedFiles([...uploadedFiles, data.fileName]);
          setImage(null);

          setTimeout(() => {
            navigate("/requirementform");
          }, 3000);
        } else {
          const error = await response.json();
          console.error("Error:", error);
        }
      } catch (error) {
        if (error.message === "No token found") {
          // Log out the user and navigate to login page if token is missing
          setToken(null);
          setLoggedIn(false);
          navigate("/login");
        }
        console.error("Error:", error);
      }
    }
  };

  return (
    <section className={styles.homesection}>
      <Container className={styles.container}>
        <h1 className={styles.h1}>Upload Image</h1>
        {alertMessage && <div className={styles.alert}>{alertMessage}</div>}
        <Form>
          <FormGroup className="mb-3">
            <div className={styles.dropArea}>
              <Form.Label className={styles.dropText}>
                Drag & drop files or{" "}
                <span className={styles.browseText}>Browse</span>
              </Form.Label>
              <Form.Control
                type="file"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
            </div>
            <Form.Text className={styles.textLight}>
              Supported formats: JPEG, PNG
            </Form.Text>
          </FormGroup>
          {image && (
            <div className={styles.preview}>
              <div className={styles.imgWrapper}>
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className={styles.previewImage}
                />
              </div>
              <div className={styles.previewContent}>
                <span className={styles.imgName}>{image.name}</span>
                <Button
                  variant="danger"
                  className={styles.removeButton}
                  onClick={handleRemoveImg}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}
          {uploadedFiles.length > 0 && (
            <div className={styles.uploadedList}>
              <h5>Uploaded</h5>
              {uploadedFiles.map((file, index) => (
                <div key={index} className={styles.uploadedFile}>
                  {file}
                </div>
              ))}
            </div>
          )}
          <Button
            onClick={handleUpload}
            disabled={!image}
            className={styles.uploadButton}
          >
            UPLOAD
          </Button>
        </Form>
      </Container>
    </section>
  );
};

export default Home;

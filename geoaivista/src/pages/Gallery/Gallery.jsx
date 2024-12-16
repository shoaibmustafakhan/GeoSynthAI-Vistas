import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import styles from "../../styles/Gallery.module.css";
// import galleryImage1 from "../../assets/galleryimage.jpg";
// import galleryImage2 from "../../assets/GalleryImage2.jpg";
// import galleryImage3 from "../../assets/GalleryImage3.jpg";

const Gallery = () => {
  const { token } = useUser();
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const [images, setImages] = useState([]);
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    // Get all the generated images on component mount
    const fetchUserGeneratedImages = async () => {
      try {
        const email = localStorage.getItem("userEmail");

        if (!email) {
          console.error("No email found in localStorage.");
          return;
        }

        // Send POST request with email in the body and token in the headers
        const response = await axios.post(
          "http://localhost:5000/api/maps",
          { email },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Pass the token for protected route access
            },
          }
        );

        // Log the fetched images in the console
        setImages(response.data);
      } catch (error) {
        console.error("Error fetching generated images:", error);
      }
    };

    fetchUserGeneratedImages();

    // // Load images from localStorage when the component mounts
    const storedImages =
      JSON.parse(localStorage.getItem("galleryImages")) || [];
    // setImages([...defaultImages, ...storedImages]);

    // Check if there's a new image passed via location state
    if (location.state?.image && location.state?.name) {
      const newImage = { src: location.state.image, name: location.state.name };
      const imageExists = storedImages.some((img) => img.src === newImage.src);
      if (!imageExists) {
        const newImages = [...storedImages, newImage];
        localStorage.setItem("galleryImages", JSON.stringify(newImages));
      }
    }
  }, [location.state, token]);

  const handleView = (image) => {
    setViewImage(`http://localhost:5000${image.imageUrl}`);
    document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setViewImage(null);
    document.body.style.overflow = "auto"; // Re-enable scrolling
  };

  const handleDownload = (image) => {
    const link = document.createElement("a");
    link.href = image.src;
    link.download = `${image.name}.jpg`; // Use the image name for the file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (index) => {
    try {
      const token = localStorage.getItem("token"); // Retrieve the JWT token
      const mapId = images[index]._id; // Ensure the ID is correct
      console.log("Deleting map with ID:", mapId); // Debugging log

      const response = await axios.delete(
        `http://localhost:5000/api/maps/${mapId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send the token in the Authorization header
          },
        }
      );

      if (response.status === 200) {
        console.log("Map deleted successfully from backend.");
        const updatedImages = images.filter((_, i) => i !== index); // Remove the map from the state
        setImages(updatedImages);
        alert("Map deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting map:", error);
      alert("Failed to delete map.");
    }
  };

  if (images.length == 0) {
    return (
      <section className={styles.section}>
        <h1>Gallery Loading</h1>
      </section>
    );
  }

  return (
    <section className={`${styles.section} ${viewImage ? styles.blur : ""}`}>
      <h1>Gallery</h1>
      <div className={styles.cardContainer}>
        {images.map((image, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img
                src={`http://localhost:5000${image.imageUrl}`}
                alt={image.imageName}
                className={styles.mapImage}
                style={{
                  width: "100%",
                  height: "auto",
                }}
              />
              <div className={styles.imageOverlay}>
                <div className={styles.imageName}>{image.imageName}</div>
              </div>
            </div>
            <div className={styles.cardContent}>
              <button
                className={styles.button}
                onClick={() => handleView(image)}
              >
                View
              </button>
              <button
                className={styles.button}
                onClick={() => handleDownload(image)}
              >
                Download
              </button>
              <button
                className={styles.button}
                onClick={() => handleDelete(index)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {viewImage && (
        <div
          className={`${styles.modal} ${styles.active}`}
          onClick={closeModal}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.close} onClick={closeModal}>
              &times;
            </span>
            <img src={viewImage} alt="view" className={styles.modalImage} />
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;

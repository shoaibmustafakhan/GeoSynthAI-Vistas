import styles from "../../styles/AboutUs.module.css";


const AboutUs = () => {
  return (
    <section className={styles.aboutSection}>
      <div className={styles.overlay}>
        <div className={styles.content}>
          <h1>About Us</h1>
          <div className={styles.infoContainer}>
            <div className={styles.infoItem}>
              <img src="\src\assets\Aim.png" alt="Icon 1" className={styles.icon} />
              <h3>Our Mission</h3>
              <p>At GeoAIVistas, our mission is to empower businesses and organizations with cutting-edge geospatial insights powered by artificial intelligence. We aim to revolutionize how geospatial data is utilized, making it more accessible and actionable for decision-making processes.</p>
            </div>
            <div className={styles.infoItem}>
              <img src="\src\assets\Technology.png" alt="Icon 2" className={styles.icon} />
              <h3>Our Technology</h3>
              <p>Our technology leverages the latest advancements in artificial intelligence, machine learning, and geospatial analytics. By integrating these technologies, we provide robust solutions for spatial data analysis, predictive modeling, and real-time monitoring, helping our clients stay ahead of the curve.</p>
            </div>
            <div className={styles.infoItem}>
              <img src="\src\assets\TeamMember.png" alt="Icon 3" className={styles.icon} />
              <h3>Our Team</h3>
              <p>Our team is comprised of experts in AI, data science, and geospatial analysis. With a diverse background in academia and industry, our professionals bring a wealth of knowledge and experience to every project. We are dedicated to delivering top-notch services and fostering innovation in the geospatial field. </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

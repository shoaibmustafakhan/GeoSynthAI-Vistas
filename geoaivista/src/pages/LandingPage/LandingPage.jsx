/** @format */

import styles from "../../styles/LandingPage.module.css";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
	const navigate = useNavigate();

    return (
		<div className={styles.wrapper}>
			<Container>
				<div className={styles.content}>
					<h1 className={styles.title}>
						Welcome to <span className={styles.titleFocus}>GeoAI: Vistas</span>
					</h1>
					<p className={styles.subtitle}>
						Revolutionizing Satellite Image Processing and Map Generation
					</p>
					<div className={styles.buttonContainer}>
						<button className={styles.button} onClick={()=> navigate("/login")}>Log In</button>
						<button className={styles.button} onClick={()=> navigate("/signup")}> Sign Up</button>
					</div>
				</div>
			</Container>
		</div>
	);
};

export default LandingPage;

/** @format */
import { useEffect } from "react";
import { Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useUser } from "../../context/UserContext";
import logo from "../../assets/logo.png";

// eslint-disable-next-line react/prop-types
const NavBar = () => {
	const { setToken, loggedIn, setLoggedIn } = useUser();
	const navigate = useNavigate();

	const handleLogin = () => {
		navigate("/login");
	};

	const handleLogout = () => {
		setToken(null);
		setLoggedIn(false);
		localStorage.removeItem("token");
		navigate("/");
	};

	useEffect(() => {}, [loggedIn]);

	return (
		<Navbar expand="lg" className={styles.nav}>
			<Navbar.Brand as={Link} to={loggedIn ? "/home" : "/login"} className={styles.navbrand}>
				<img src={logo} height="30" alt="logo" />
			</Navbar.Brand>
			<Navbar.Toggle aria-controls="basic-navbar-nav" />
			<Navbar.Collapse id="basic-navbar-nav">
				<Nav className={styles.centerNav}>
					<Nav.Link
						as={Link}
						to={loggedIn ? "/home" : "/login"}
						className={styles.navlink}>
						Home
					</Nav.Link>
					<Nav.Link
						as={Link}
						to={loggedIn ? "/gallery" : "/login"}
						className={styles.navlink}>
						Gallery
					</Nav.Link>
					<Nav.Link as={Link} to="/about-us" className={styles.navlink}>
						About
					</Nav.Link>
				</Nav>
				<Nav>
					{loggedIn ? (
						<button className={styles.Btn} onClick={handleLogout}>
							<div className={styles.sign}>
								<svg viewBox="0 0 512 512">
									<path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
								</svg>
							</div>
							<div className={styles.text}>Logout</div>
						</button>
					) : (
						<button className={styles.button} onClick={handleLogin}>
							Login
						</button>
					)}
				</Nav>
			</Navbar.Collapse>
		</Navbar>
	);
};

export default NavBar;

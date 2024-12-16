/** @format */

import { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/SignUp.module.css";
export default function SignUp() {
	const emailRef = useRef();
	const passwordRef = useRef();
	const passwordConfirmRef = useRef();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	async function handleSubmit(e) {
		e.preventDefault();

		if (passwordRef.current.value !== passwordConfirmRef.current.value) {
			return setError("Passwords do not match");
		}

		const email = emailRef.current.value;
		const password = passwordRef.current.value;

		try {
			const response = await fetch("http://localhost:5000/api/users/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Something went wrong!");
			} else {
				navigate("/login");
			}
		} catch (error) {
			setError(error.message);
			setLoading(false);
			return;
		}
	}

	return (
		<div className={styles.container}>
			<div className={styles.left}></div>
			<div className={styles.right}>
				<Card className={styles.card}>
					<Card.Body>
						<h2 className="text-center mb-4">Sign Up</h2>
						{error && <Alert variant="danger">{error}</Alert>}
						<Form onSubmit={handleSubmit}>
							<Form.Group id="email" className={styles.formGroup}>
								<Form.Label>Email</Form.Label>
								<Form.Control
									type="email"
									ref={emailRef}
									required
									className={styles.formControl}
								/>
							</Form.Group>
							<Form.Group id="password" className={styles.formGroup}>
								<Form.Label>Password</Form.Label>
								<Form.Control
									type="password"
									ref={passwordRef}
									required
									className={styles.formControl}
								/>
							</Form.Group>
							<Form.Group id="password-confirm" className={styles.formGroup}>
								<Form.Label>Confirm Password</Form.Label>
								<Form.Control
									type="password"
									ref={passwordConfirmRef}
									required
									className={styles.formControl}
								/>
							</Form.Group>
							<Button
								disabled={loading}
								className={`${styles.button} w-100`}
								type="submit">
								Sign Up
							</Button>
						</Form>
						<div className="w-100 text-center mt-2">
							Already have an account? <Link to="/login">Log In</Link>
						</div>
					</Card.Body>
				</Card>
			</div>
		</div>
	);
}

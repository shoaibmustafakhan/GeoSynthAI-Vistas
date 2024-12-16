/** @format */

const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "30d",
	});
};

exports.registerUser = async (req, res) => {
	const { email, password } = req.body;
	try {
		let user = await User.findOne({ email });

		if (user) {
			return res.status(400).json({ message: "User already exists" });
		}

		user = new User({ email, password });
		await user.save();

		if (user) {
			const token = generateToken(user._id);
			return res.status(201).json({
				_id: user._id,
				email: user.email,
				token: token,
			});
		} else {
			return res.status(400).json({ message: "Invalid user data" });
		}
	} catch (error) {
		console.error(error.message);
		return res.status(500).json({ message: "Server Error" });
	}
};

exports.authUser = async (req, res) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user || !(await user.matchPassword(password))) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const token = generateToken(user._id);

		return res.status(200).json({
			_id: user._id,
			email: user.email,
			token: token,
		});
	} catch (error) {
		console.error(error.message);
		return res.status(500).json({ message: "Server Error" });
	}
};

exports.getUserProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ message: "User not found" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

exports.updateUserProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		if (user) {
			user.email = req.body.email || user.email;

			if (req.body.password) {
				user.password = req.body.password;
			}

			const updatedUser = await user.save();

			res.json({
				_id: updatedUser._id,
				email: updatedUser.email,
				token: generateToken(updatedUser._id),
			});
		} else {
			res.status(404).json({ message: "User not found" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

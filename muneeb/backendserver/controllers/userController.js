const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/authToken");

const JWT_SECRET = process.env.JWT_SECRET;

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  try {
    const isValidEmail = /\S+@\S+\.\S+/.test(email);
    if (!isValidEmail) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(400).json({ message: "Error registering user. Please try again." });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(res, user, `Welcome back, ${user.firstName}!`);
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found."});
    }
    res.status(200).json({ 
      success: true,
      user });
} catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Internal server error" });
  }

};

exports.logoutUser = async (req, res) => {
  try {
    res.clearCookie("docToken");
    res.status(200).json({ message: "Logged out successfully!" });
  } catch (err) {
    console.error("Error logging out:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

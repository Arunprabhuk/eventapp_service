// src/controllers/authController.js
import User from "../model/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const generateToken = (user) => {
  const payload = {
    userId: user._id,
    username: user.username,
    userRole: user.userRole,
  };
  const secretKey = process.env.SECRET_KEY;
  const options = { expiresIn: "1h" };

  return jwt.sign(payload, secretKey, options);
};

export const signup = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      phoneNumber,
      userRole,
    } = req.body;
    console.log(crypto.randomBytes(32).toString("hex"));
    if (!["organizer", "participant"].includes(userRole)) {
      return res.status(400).json({
        error: 'Invalid user role. Use either "organizer" or "participant".',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const user = new User({
      username,
      email,
      password,
      confirmPassword,
      phoneNumber,
      userRole,
    });
    await user.save();

    res.status(201).json({ message: `${userRole} registered successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user);
      return res.json({
        message: "Login successful",
        userRole: user.userRole,
        token,
      });
    }

    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

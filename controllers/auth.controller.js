import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { User } from "../models/user.model.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  const hashed = await bcryptjs.hash(password, 10);
  const user = await User.create({ email, password: hashed, name });

  generateTokenAndSetCookie(res, user._id);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: { id: user._id, email: user.email, name: user.name },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid credentials" });
  }

  const valid = await bcryptjs.compare(password, user.password);
  if (!valid) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid credentials" });
  }

  generateTokenAndSetCookie(res, user._id);
  user.lastLogin = Date.now();
  await user.save();

  res.json({
    success: true,
    message: "Logged in successfully",
    user: { id: user._id, email: user.email, name: user.name },
  });
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
};

import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// example protected route
router.get("/me", verifyToken, (req, res) => {
  res.json({ success: true, userId: req.userId });
});

export default router;

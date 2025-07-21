import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/connectDB.js";
//import authRoutes from "./routes/auth.route.js";
import bookingRoutes from "./routes/booking.js";
import reservationRoutes from "./routes/reservation.js";
import roomCategoryRoutes  from "./routes/roomCategory.js";
import roomRoutes from "./routes/room.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://havanafrontend-pi5p.vercel.app"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("API is up and running!"));

// Auth routes
//app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reservation", reservationRoutes);
app.use("/api/room-categories", roomCategoryRoutes);
app.use("/api/rooms", roomRoutes);

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);

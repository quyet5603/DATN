import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import passport from './config/passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();
const port = process.env.PORT || 8080;



// Database connection
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());

// Session configuration for Passport
app.use(session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directories if they don't exist
const uploadDirs = ['uploads', 'uploads/resume', 'uploads/avatars'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Import routes
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import applicationRoutes from "./routes/applicationRoutes.js"
import fileUploadRoute from './routes/fileUploadRoute.js'
import Auth from './routes/Auth.js'
import aiRoutes from './routes/aiRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import cvRoutes from './routes/cvRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

// Use routes
app.use("/jobs", jobRoutes);
app.use("/users", userRoutes);
app.use("/application", applicationRoutes);
app.use("/", fileUploadRoute);
app.use("/auth", Auth)
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/notifications", notificationRoutes);

// Routes
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("*", (req, res) => {
  res.redirect("/");
}
);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const routes = require("./routes");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

dotenv.config();

// --- Middleware Setup ---
// The order is crucial: CORS, cookies, body parsers, then routes.

app.use(cors({
  origin: 'https://lively-daffodil-f1eeff.netlify.app',
  credentials: true
}));

app.use(cookieParser());

// Body parsers must come BEFORE your routes.
// This allows multer (on specific routes) and the JSON parser (on others) to work correctly.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Routes ---
// Place your routes AFTER all global middleware.
app.use("/api/v1", routes);


// --- Global Error Handler (Good Practice) ---
app.use((err, req, res, next) => {
  console.error("An error occurred:", err.stack);
  
  // Handle Multer-specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File size is too large. Maximum is 10MB.' });
  }

  // Generic error response
  if (!res.headersSent) {
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("Mongoose connection closed");
    process.exit(0);
  });
});

module.exports = app;

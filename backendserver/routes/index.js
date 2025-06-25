const express = require("express");
const userRoutes = require("./userRoutes");
const doctorRoutes = require("./doctorRoutes");
const appointmentRoutes = require("./appointmentRoutes");

const router = express.Router();

router.use("/users", userRoutes);
router.use("/doctors", doctorRoutes);
router.use("/appointments", appointmentRoutes);

module.exports = router;

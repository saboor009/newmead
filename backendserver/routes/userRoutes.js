const express = require("express");
const { registerUser, loginUser, getUserDetails, logoutUser } = require("../controllers/userController");
const { authenticateUser } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile",authenticateUser,getUserDetails);
router.get("/logout",authenticateUser,logoutUser);

module.exports = router;

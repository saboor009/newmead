const express = require("express");
const { registerDoctor, loginDoctor, getDoctorProfile, getAllDoctors, getDoctorDetail,logoutDoctor,updateDoctor } = require("../controllers/doctorController");
const { authenticateDoctor } = require("../middlewares/authMiddleware");

const upload = require("../utils/multer");

const router = express.Router();

router.post("/register", upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'degreeDocument', maxCount: 1 }
])  , registerDoctor);
router.post("/login", loginDoctor);
router.put("/profile/update", authenticateDoctor, upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'degreeDocument', maxCount: 1 }
]), updateDoctor);
router.get("/profile", authenticateDoctor, getDoctorProfile);
router.get("/allDisplay", getAllDoctors);

router.get("/details/:id", getDoctorDetail);

router.get("/logout", logoutDoctor);


module.exports = router;

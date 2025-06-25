const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateDocToken } = require("../utils/authToken");
const { uploadMedia, deleteMedia, uploadPdf } = require("../utils/cloudinary");

// Register Doctor
const registerDoctor = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, specialization, licenseNumber, Age, Gender, address } = req.body;
    
    // Access files from req.files (not req.file)
    const profilePhoto = req.files?.profilePhoto?.[0];
    const degreeDocument = req.files?.degreeDocument?.[0];

    console.log("Files received:", { profilePhoto: !!profilePhoto, degreeDocument: !!degreeDocument });

    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !phone || !password || !specialization || !licenseNumber || !profilePhoto || !degreeDocument) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: "Doctor already registered" });
    }

    // Upload files to Cloudinary
    const profilePhotoUrl = profilePhoto ? await uploadMedia(profilePhoto.path) : "";
    const degreeDocumentUrl = degreeDocument ? await uploadPdf(degreeDocument.path) : null;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new doctor
    const newDoctor = new Doctor({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      profilePhoto: profilePhotoUrl ? profilePhotoUrl.secure_url : "",
      Age,
      Gender,
      address,
      specialization,
      degreeDocument: degreeDocumentUrl ? degreeDocumentUrl.secure_url : "",
      licenseNumber,
    });

    await newDoctor.save();

    res.status(201).json({ success: true, message: "Doctor registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Error registering doctor" });
  }
};
// Login Doctor
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ success: false, message: "Doctor not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    generateDocToken(res,doctor, `Welcome back, ${doctor.firstName}!`);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Error logging in" });
  }
};

// Get Doctor Profile
const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctor).select("-password"); // Exclude password
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};
 
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json({doctors});
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ success: false, message: "Error fetching doctors" });
  }
};

const getDoctorDetail = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ success: false, message: "Error fetching doctor" });
  }
};

const logoutDoctor = async (req, res) => {
  try {
    res.clearCookie("doctorToken");
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Error logging out" });
  }
}

const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    // Example URL: http://res.cloudinary.com/cloud_name/image/upload/v123/Doctor/abc123.jpg
    // We want to extract "Doctor/abc123"
    try {
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) return null;
        
        const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
        const lastDotIndex = publicIdWithExtension.lastIndexOf('.');
        return lastDotIndex === -1 ? publicIdWithExtension : publicIdWithExtension.substring(0, lastDotIndex);
    } catch (error) {
        console.error("Could not parse public_id from URL:", url, error);
        return null;
    }
};

const updateDoctor = async (req, res) => {
  try {
    const doctorId = req.doctor; // From authenticateDoctor middleware
    if (!doctorId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Find the current doctor to get old file URLs for deletion
    const currentDoctor = await Doctor.findById(doctorId);
    if (!currentDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const updateData = { ...req.body };

    // 1. Handle password update
    if (updateData.password && updateData.password.trim() !== "") {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password; // Don't update password if it's empty or not provided
    }

    // 2. Handle file updates
    if (req.files) {
      // Handle profile photo update
      if (req.files.profilePhoto) {
        const newImage = await uploadMedia(req.files.profilePhoto[0].path);
        if (newImage) {
          // Delete the old photo if it exists
          if (currentDoctor.profilePhoto) {
            const oldPublicId = getPublicIdFromUrl(currentDoctor.profilePhoto);
            if (oldPublicId) await deleteMedia(oldPublicId);
          }
          updateData.profilePhoto = newImage.secure_url;
        }
      }

      // Handle degree document update
      if (req.files.degreeDocument) {
        const newDocument = await uploadPdf(req.files.degreeDocument[0].path);
        if (newDocument) {
          // Delete the old document if it exists
          if (currentDoctor.degreeDocument) {
            const oldPublicId = getPublicIdFromUrl(currentDoctor.degreeDocument);
            if (oldPublicId) await deleteMedia(oldPublicId);
          }
          updateData.degreeDocument = newDocument.secure_url;
        }
      }
    }

    // 3. Update the doctor in the database
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found during update" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      doctor: updatedDoctor,
    });

  } catch (error) {
    console.error("Update Doctor Error:", error);
    res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
  }
};

module.exports = { registerDoctor, loginDoctor, getDoctorProfile,getAllDoctors,getDoctorDetail,logoutDoctor,updateDoctor };

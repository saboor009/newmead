const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  profilePhoto: { type: String }, // Store file path or URL
  Age: { type: Number, required: true },
  Gender: { type: String, required: true },
  address: { type: String, required: true },
  specialization: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  degreeDocument: { type: String }, // Store file path or URL
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Doctor", DoctorSchema);

const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorName: { type: String, required: true },
    userName: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ["pending", "confirmed", "completed", "canceled"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
    consultationFee: { type: Number, required: true },
    });


const Appointment = mongoose.model("Appointment", AppointmentSchema);
module.exports = Appointment;
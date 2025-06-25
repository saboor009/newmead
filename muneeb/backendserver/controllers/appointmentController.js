const Appointment = require("../models/Appointment");

// Change export to module.exports for Node.js
module.exports.createAppointment = async (req, res) => {
    try {
        const { doctorId, userId, doctorName, userName, date, time, consultationFee } = req.body;

        // Check if all required fields are provided
        if (!doctorId || !userId || !doctorName || !userName || !date || !time || !consultationFee) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Create new appointment
        const newAppointment = new Appointment({
            doctorId,
            userId,
            doctorName,
            userName,
            date,
            time,
            consultationFee,
        });

        // Save appointment in MongoDB
        await newAppointment.save();

        res.status(201).json({ success: true, message: "Appointment created successfully", appointment: newAppointment });
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ success: false, message: "Error creating appointment" });
    }
};

module.exports.getDoctorAppointments = async (req, res) => {

    try {
        const { doctorId } = req.params;

        // Find appointments for the given doctor
        const appointments = await Appointment.find({ doctorId });

        if (!appointments) {
            return res.status(404).json({ success: false, message: "No appointments found" });
        }

        res.status(200).json({ success: true, appointments });
    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        res.status(500).json({ success: false, message: "Error fetching appointments" });
    }
}


module.exports.getUserAppointments = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find appointments for the given user
        const appointments = await Appointment.find({ userId });
        if (!appointments) {
            return res.status(404).json({ success: false, message: "No appointments found" });
        }
        res.status(200).json({ success: true, appointments });
    }
    catch (error) {
        console.error("Error fetching user appointments:", error);
        res.status(500).json({ success: false, message: "Error fetching appointments" });
    }
}
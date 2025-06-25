const express = require('express');
const { createAppointment, getDoctorAppointments, getUserAppointments } = require('../controllers/appointmentController');
const { authenticateUser, authenticateDoctor } = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/create',authenticateUser,createAppointment);
router.get('/doctor/appointments/:doctorId', authenticateDoctor, getDoctorAppointments);
router.get('/user/appointments/:userId', authenticateUser, getUserAppointments);

module.exports = router;

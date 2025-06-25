const jwt = require("jsonwebtoken");

module.exports.authenticateUser = (req, res, next) => {
  const token = req.cookies.docToken;

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports.authenticateDoctor = (req, res, next) => {
  const token = req.cookies.doctorToken;

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.doctor = decoded.docId;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
}

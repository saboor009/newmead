jwt = require("jsonwebtoken");

module.exports.generateToken = (res, user, message) => {
    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET,{expiresIn: '1d'});
    res.status(200).cookie('docToken', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    }).json({
        success: true,
        message,
        user
    });
   
};

module.exports.generateDocToken = (res, doctor, message) => {
    const token = jwt.sign({docId: doctor._id}, process.env.JWT_SECRET,{expiresIn: '1d'});
    res.status(200).cookie('doctorToken', token, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
    }).json({
        success: true,
        message,
        doctor
    });

};
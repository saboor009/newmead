const multer = require('multer');

const upload = multer({
    dest: "uploads/",
    limits: { 
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'profilePhoto') {
            // Accept only images
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Profile photo must be an image'), false);
            }
        } else if (file.fieldname === 'degreeDocument') {
            // Accept only PDFs
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            } else {
                cb(new Error('Degree document must be a PDF'), false);
            }
        } else {
            cb(null, true);
        }
    }
});

module.exports = upload;
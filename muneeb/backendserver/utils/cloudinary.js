const {v2: cloudinary} = require('cloudinary');
const dotenv = require('dotenv');
dotenv.config({});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMedia = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: "Doctor",
            resource_type: "auto",
            access_mode: "public",
            bytes_limit: 10485760,
        });
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const uploadPdf = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: "Doctor",
            resource_type: "raw", // For PDF files
            access_mode: "public",
            bytes_limit: 10485760,
        });
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

const deleteMedia = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.log(error);
    }
}


module.exports = { uploadMedia, deleteMedia,uploadPdf};
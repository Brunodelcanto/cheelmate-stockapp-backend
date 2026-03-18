import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'cheelmate_products',
        allowed_formats: ['jpg', 'png', 'jpeg']
    } as any
})

export { cloudinary, storage };
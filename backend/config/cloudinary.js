    import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: 'dxevxrf2x',
  api_key: '268845547863933',
  api_secret: 'cfUiTD3xE8l21KHHAxd5-vTFmjQ',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'formbuilder_uploads', // Cloudinary folder
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});

export { cloudinary, storage };

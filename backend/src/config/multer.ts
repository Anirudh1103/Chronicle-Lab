import multer from 'multer';
import path from 'path';

// Use memory storage so raw files are processed in-buffer by Sharp
// and never stored directly on disk in their original uncompressed format.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for high-resolution AI artwork
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|avif/;
    const mimetype = filetypes.test(file.mimetype.toLowerCase());
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, JPEG, PNG, WEBP, and AVIF image files are allowed.'));
  },
});

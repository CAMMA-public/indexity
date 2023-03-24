import { SUPPORTED_VIDEO_MIMETYPES } from '../constants';

export const validateVideoUpload = async (req, file, cb): Promise<void> => {
  if (!SUPPORTED_VIDEO_MIMETYPES.includes(file.mimetype)) {
    if (typeof req.fileValidationErrors === 'undefined') {
      req.fileValidationErrors = '';
    }
    req.fileValidationErrors = `${req.fileValidationErrors}, ${file.originalname}: Unsupported MIME type`;
    return cb(null, false);
  }
  return cb(null, true);
};

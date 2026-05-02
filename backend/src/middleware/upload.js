const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { id } = require('../utils/helpers');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

function ensureUploadFolder(subfolder) {
  const dir = path.join(UPLOAD_ROOT, subfolder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function createUploader(subfolder) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, ensureUploadFolder(subfolder));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '');
      cb(null, `${id('file')}${ext}`);
    },
  });

  return multer({ storage });
}

module.exports = {
  createUploader,
};

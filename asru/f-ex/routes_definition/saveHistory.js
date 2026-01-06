const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3 } = require('../config');
const { decryptQueryParam, saveFileUrlsToMongoDB } = require('../utils');

// Configure Multer-S3
const upload = multer({
   storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      acl: 'public-read',
      key: function (req, file, cb) {
         cb(null, file.originalname);
      }
   }),
   limits: { fileSize: 100 * 1024 * 1024 } // 100mb
}).single('file');

const saveHistory = async (req, res) => {
   upload(req, res, async (err) => {

      if (err) {
         console.error('Multer error:', err);
         return res.status(500).send('Error uploading file.');
      }

      try {
         const originalFile = req.file;
         if (!originalFile) {
            return res.status(400).send('File is required.');
         }
         // Process the original file to create a new file
         const formattedFile = await processFile(originalFile);

         // Save the file URLs to MongoDB (assuming processFile returns the file URLs)
         const originalFileUrl = originalFile.location;
         const formattedFileUrl = formattedFile.location;
         const params = decryptQueryParam(decodeURIComponent(req.query.params));
         console.log('params:', params);
         const { msId } = params;
         console.log('msId:', msId);
         const uniqueId = await saveFileUrlsToMongoDB(msId, originalFileUrl, formattedFileUrl, req.file.originalname, '');
         res.send({ uniqueId: uniqueId });
      } catch (err) {
         console.error('Error:', err);
         res.status(500).send('Error processing file.');
      }
   });
};

async function processFile(file) {
   // Your logic to process the file and create a new file
   // Return the new file object with location or path
   return file;
}

module.exports = saveHistory;

const router = require('express').Router();
const path = require('path');
const multer = require('multer');
require('dotenv').config();
const { saveHistory, updateHistory, userHistory, convertToExcel, jsonToCsv } = require('../routes_definition');

const storage = multer.diskStorage({
   destination: async (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../../public/uploads/');
      cb(null, uploadPath);
   },
   filename: (req, file, cb) => {
      cb(null, file.originalname);
   }
});

const upload_local = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } });

/* GET home page. */
router.get('/', function (req, res, next) {
   res.render('index', { title: 'Express' });
});

// Assuming you have a form to upload files
router.post('/save-history', saveHistory);
router.post('/update-history', updateHistory);
router.post('/convert-to-excel', upload_local.single('file'), convertToExcel);
router.get('/user_history', userHistory);
router.post('/json-to-csv', jsonToCsv);

module.exports = router;

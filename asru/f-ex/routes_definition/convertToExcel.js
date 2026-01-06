const path = require('path');
const { readXlsmFile } = require('../utils');

const convertToExcel = async (req, res) => {
   try {
      const file = req.file;
      if (!file) {
         return res.status(400).send('File is required.');
      }

      // read the file extension
      const extension = file.originalname.split('.').pop();
      // check if the file is in xlsm format
      if (extension !== 'xlsm') {
         return res.status(400).send('Only xlsm files are allowed.');
      }

      const xlsm_FilePath = path.join(__dirname, '../../public/uploads/', file.filename);
      let outputFilePath = path.join(__dirname, '../converted_report.xlsx');

      await readXlsmFile(xlsm_FilePath, outputFilePath);

      // send the file back to client
      res.setHeader('filename', 'filename.xlsx');
      res.setHeader('Access-Control-Expose-Headers', 'fileName');
      res.sendFile(outputFilePath);
   } catch (err) {
      res.status(500).send('Internal server error');
   }
};

module.exports = convertToExcel;

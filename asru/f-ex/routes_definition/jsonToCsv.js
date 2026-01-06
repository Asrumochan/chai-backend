require('dotenv').config();
const path = require('path');
const jsonexport = require('jsonexport');
const fs = require('fs');
const csvtoexcelconverter = require('csvtoxlsxconverter');
const { s3 } = require('../config');
const { userCollection, ObjectId } = require('../config/db');
const { colorErrorCells, addPivoteTable, fetchFileName } = require('../utils');

const jsonToCsv = async function (req, res, next) {
   const data = req.body.data.final_table;

   if (!data.length) {
      console.log('No data found');
      res.status(400).send('No data found');
      return;
   }

   const uniqueId = req.body.uniqueId;
   const myObj = {
      rows: data
   };

   try {
      const csv = await jsonexport(myObj.rows);
      if (csv) {
         // console.log('CSV generated:', csv);
         // Generate a unique filename for CSV
         const csvFileName = `csv-${Date.now()}.csv`;
         const csvFilePath = path.join(__dirname, '../../public/uploads/temp', csvFileName);

         // Write the CSV file
         await fs.promises.writeFile(csvFilePath, csv, { encoding: 'utf8' });

         // Upload CSV to S3
         const csvFileContent = fs.readFileSync(csvFilePath);
         const csvParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: csvFileName, // Ensure unique key
            Body: csvFileContent,
            ACL: 'public-read'
         };

         const csvUploadResult = await s3.upload(csvParams).promise();
         const csvFileUrl = csvUploadResult.Location;
         // console.log('CSV file uploaded to S3 at:', csvFileUrl);

         // Generate a unique filename for Excel
         const fileName = await fetchFileName(uniqueId);
         const fileNameWithoutExtension = fileName.split('.')[0];
         const excelFileName = `${fileNameWithoutExtension}_converted_report-${Date.now()}.xlsx`;
         let excelFilePath = path.join(__dirname, '../../public/uploads/temp', excelFileName);

         // Convert CSV to Excel
         await new Promise((resolve, reject) => {
            csvtoexcelconverter(csvFilePath, excelFilePath, (err) => {
               if (err) {
                  console.error('Error converting CSV to Excel:', err);
                  return reject(err);
               }
               // console.log('Excel file generated at:', excelFilePath);
               resolve();
            });
         });
         await new Promise((resolve) => setTimeout(resolve, 1000));
         // Check if the Excel file exists before proceeding
         if (!fs.existsSync(excelFilePath)) {
            console.error('Excel file does not exist:', excelFilePath);
            return res.status(500).send('Error generating Excel file');
         }
         try {
            excelFilePath = await addPivoteTable(excelFilePath, req.body.data);
            excelFilePath = await colorErrorCells(excelFilePath);
            console.log('Excel file updated with pivot table and color :', excelFilePath);
         } catch (err) {
            console.error('Error adding pivot table aor color:', err);
         }

         // Upload Excel to S3
         const excelFileContent = fs.readFileSync(excelFilePath);
         const excelParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: excelFileName, // Ensure unique key
            Body: excelFileContent,
            ACL: 'public-read'
         };

         const excelUploadResult = await s3.upload(excelParams).promise();
         const formattedFileUrl = excelUploadResult.Location;
         console.log('Excel file uploaded to S3 at:', formattedFileUrl);

         // Update MongoDB
         try {
            await userCollection.updateOne(
               { _id: new ObjectId(uniqueId) },
               {
                  $set: {
                     status: req.body.remarks != 'Successfully Converted' ? 'Completed with errors' : 'Completed',
                     csvFileUrl: csvFileUrl, // Store CSV file URL
                     formattedFileUrl: formattedFileUrl, // Store Excel file URL
                     time: new Date(),
                     remarks: req.body.remarks
                  }
               }
            );
         } catch (e) {
            console.error('Error updating MongoDB:', e);
            return res.status(500).send('Internal Server Error');
         }

         // Send the Excel file to the user
         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
         res.setHeader('Content-Disposition', `attachment; filename=${excelFileName}`);
         res.sendFile(excelFilePath);
      }
   } catch (err) {
      console.error('Error in json-to-csv:', err);
      return res.status(500).send('Error processing data');
   }
};

module.exports = jsonToCsv;

const ExcelJS = require('exceljs');

const colorErrorCells = (excelFilePath) => {
   return new Promise((resolve, reject) => {
      const workbook = new ExcelJS.Workbook();
      workbook.xlsx
         .readFile(excelFilePath)
         .then(() => {
            const worksheet = workbook.getWorksheet('Sheet1'); // Use the actual sheet name
            console.log('worksheet loaded');

            worksheet.eachRow((row, rowIndex) => {
               row.eachCell((cell, colNumber) => {
                  if (
                     typeof cell.value === 'string' &&
                     (cell.value.includes('Relationship value not available') || cell.value.includes('relationship value not available'))
                  ) {
                     // Ensure a style object exists
                     if (!cell.s) {
                        cell.s = {};
                     }

                     // Set the cell's font color
                     cell.font = {
                        color: { argb: 'FFFF0000' } // Red color
                     };
                  }
               });
            });

            workbook.xlsx
               .writeFile(excelFilePath)
               .then(() => {
                  console.log('Excel file updated successfully!');
                  resolve(excelFilePath); // Resolve with the updated path
               })
               .catch((error) => {
                  console.error('Error saving Excel file:', error);
                  reject(error); // Reject if there's an error
               });
         })
         .catch((error) => {
            console.error('Error reading Excel file:', error);
            reject(error);
         });
   });
};

module.exports = colorErrorCells;

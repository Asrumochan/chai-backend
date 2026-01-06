const ExcelJS = require('exceljs');

async function readXlsmFile(originalFilePath, outputFilePath) {
   // Read the first visible sheet in the workbook
   try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(originalFilePath);

      // Get the total sheet count
      const totalSheetCount = workbook.worksheets.length;
      console.log('Total sheet count:', totalSheetCount);
      console.log(
         'Sheet names:',
         workbook.worksheets.map((sheet) => sheet.name)
      );

      // Find the visible sheet
      let visibleSheet;
      for (const sheet of workbook.worksheets) {
         console.log('Sheet name:', sheet.name, 'Hidden:', sheet.state);
         if (sheet.state === 'visible') {
            visibleSheet = sheet;
            break;
         }
      }

      console.log('Visible sheet name:', visibleSheet.name);

      const newWorkbook = new ExcelJS.Workbook();
      const newSheet = newWorkbook.addWorksheet('Sheet1');

      visibleSheet.eachRow((row, rowNumber) => {
         const newRow = newSheet.getRow(rowNumber);
         row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            // Check if the cell has a formula
            if (cell.type === ExcelJS.ValueType.Formula) {
               // Copy only the result of the formula
               newRow.getCell(colNumber).value = cell.result;
            } else {
               // Copy the cell value directly
               newRow.getCell(colNumber).value = cell.value;
            }
         });
      });

      // Handle merged cells
      visibleSheet.model.merges.forEach((merge) => {
         newSheet.mergeCells(merge);
         newSheet.unMergeCells(merge);
      });

      // visibleSheet.model.merges.forEach((merge) => {
      //    const { top, left } = merge;
      //    const value = visibleSheet.getCell(top, left).value;
      //    newSheet.unMergeCells(merge);
      //    newSheet.getCell(top, left).value = value;
      // });

      await newWorkbook.xlsx.writeFile(outputFilePath);
      console.log('New workbook written successfully to', outputFilePath);
   } catch (error) {
      console.log('Error:', error);
   }
}

module.exports = readXlsmFile;

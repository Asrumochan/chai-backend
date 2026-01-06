const ExcelJS = require('exceljs');

const genPivoteHeader = (tierData) => {
   let output = {};
   for (let key in tierData) {
      output[key] = key;
   }
   return output;
};
function extractHeaders(data) {
   if (!data || data.length === 0) {
     return [];
   }
 
   const firstObject = data[0];
   if (typeof firstObject !== 'object' || firstObject === null) {
     return [];
   }
   const headers = Object.keys(firstObject);
   return headers;
 }
 
const addPivoteTable = async (fileUrl, data) => {
   return new Promise(async (resolve, reject) => {
      try {
         const workbook = new ExcelJS.Workbook();
         await workbook.xlsx.readFile(fileUrl);

         let { tier2, tier3, tier4, tier2CR, tier3CR, tier4CR } = data;
         let pivoteSampleData = {}
         let pivoteTierHeader = genPivoteHeader(pivoteSampleData);  // Changed to let
         const pivoteCRSampleData = tier2CR?.length ? tier2CR[0] : tier3CR?.length ? tier3CR[0] : tier4CR?.length ? tier4CR[0] : {};
         let pivoteCR_Header = genPivoteHeader(pivoteCRSampleData); // Changed to let
         const firstKey = Object.keys(pivoteTierHeader)[0];
         const firstCR_Key = Object.keys(pivoteCR_Header)[0];

         let tierData = [];
         if (Object.keys(pivoteCRSampleData).length) {
            tierData = [
               { [firstKey]: 'Count of 4 tier' },
               { ...(tier4.length ? extractHeaders(tier4):{})},
               ...tier4,
               {},
               { [firstCR_Key]: 'Cobra Retiree - 4 tier' },
               { ...(tier4CR?.length ? extractHeaders(tier4CR):{})},
               ...tier4CR,
               {},
               {},
               { [firstKey]: 'Count of 3 tier' },
               { ...(tier3.length ? extractHeaders(tier3):{})},
               ...tier3,
               {},
               { [firstCR_Key]: 'Cobra Retiree - 3 tier' },
               {...(tier3CR?.length ?extractHeaders( tier3CR):{})},
               ...tier3CR,
               {},
               {},
               { [firstKey]: 'Count of 2 tier' },
               {...(tier2.length ?extractHeaders( tier2):{})},
               ...tier2,
               {},
               { [firstCR_Key]: 'Cobra Retiree - 2 tier' },
               { ...(tier2CR?.length ? extractHeaders(tier2CR):{})},
               ...tier2CR
            ];
         } else {
            tierData = [
               { [firstKey]: 'Count of 4 tier' },
                { ...(tier4.length ? extractHeaders(tier4):{})},
               ...tier4,
               {},
               {},
               { [firstKey]: 'Count of 3 tier' },
               { ...(tier3.length ? extractHeaders(tier3):{})},
               ...tier3,
               {},
               {},
               { [firstKey]: 'Count of 2 tier' },
                { ...(tier2.length ? extractHeaders(tier2):{})},
               ...tier2
            ];
         }

         const worksheet = workbook.addWorksheet('Pivot table');

         // Add rows to the worksheet
         tierData.forEach((row) => {
            worksheet.addRow(Object.values(row));
         });

         await workbook.xlsx.writeFile(fileUrl);
         resolve(fileUrl);
      } catch (error) {
         reject(error);
      }
   });
};

module.exports = addPivoteTable;

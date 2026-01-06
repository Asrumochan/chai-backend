const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const XlsxPopulate = require('xlsx-populate');

/* GET users listing. */
router.get('/', function (req, res, next) {
   res.send('respond with censusInternal');
});

router.post('/samx-one', async function (req, res, next) {
   const employees = req.body.employees || getSampleMockData() || [];
   try {
      // format data here acc to given template
      if (employees.length) {
         const templateData = extractEmpdata(employees);
         // populate the data in excel template - SAMx_One_Census_Template_With_Deps.xlsx
         const template = await updateSamxOneTemplate(templateData);
         res.sendFile(template);
         //   res.send(convertXLsxPopulateAccepetableFormat(templateData));
      }
   } catch (error) {
      console.error('Error reading file:', error);
      res.status(500).send('Error reading file');
   }
});

module.exports = router;

function getSampleMockData() {
   try {
      const data = fs.readFileSync(path.join(__dirname, '../../public/files/samples/samx-mock.json'), 'utf8');
      const jsonData = JSON.parse(data);
      return jsonData;
   } catch (err) {
      console.error('Error reading file:', err);
      return [];
   }
}

function extractEmpdata(employees) {
   const empTemplateFields = {
      type: 'Employee',    // A
      relationship: '',    // B
      skipCell_C: '',         // C
      skipCell_D: '',         // D
      zipCode: '',         // E
      lastName: '',
      firstName: '',
      skipCell_H: '',         // H
      dob: '',         // I
      age: '',
      gender: '',
      skipCell_L: '',         // L
      employeeClass: '',
      skipCell_N: '',         // N
      skipCell_O: '',         // O
      salary: '',
      skipCell_Q: '',         // Q
      medicalCovType: '',
      skipCell_S: '',         // S
      dentalCovType: '',
      visionCovType: '',
      lifeCovType: '',
      stdCovType: '',
      ltdCovType: '',
      waiveAllProducts: '', // leave it as blank.. Ankur
      medicalPlan: null, // formula
      skipCell_AA: '', // AA
      memberAutoSign: '', // formula
      medPcpId: '', // formula
      existingPatient: '', // formula
      dentalPlan: '', // formula
      visionPlan: '', // formula
      basicLifePlan: '', // formula
      basicDepLifePlanCode: '', // formula
      supLifePlanCode: '', // formula
      supDepLifeSpousePlanCode: '', // formula
      supDepLifeChildPlanCode: '', // formula
      stdPlanCode: '', // formula
      ltdPlanCode: '', // formula
      ownerNotCoveredByWorkersComp: '', // ---------------------manual entry
      hoursWorked: '', // formula
      dateOfHire: '', // formula
      ssn: '', // formula
      // reasonSsnNotProvided: '', // formula
      // address1: '', // formula
      // address2: '', // formula
      // city: '', // formula
      // state: '', // formula
      // zip: '', // formula
      // county: '', // formula
      // email: '', // formula
      // phoneNumber: '', // formula
      // phoneType: '', // formula
      // heightFeet: '', // formula
      // heightInches: '', // formula
      // weight: '', // formula
      // tobacco: '', // formula
      // dayThisCoverageBegins: '', // ---------------------manual entry
      // nameOfOtherCarrier: '', // formula
      // medicarePrimary: '', // formula
      // medicareReason: '', // formula
      // medicareClaimNumber: '', // formula
      // medicarePartAStartDate: '', // formula
      // medicarePartBStartDate: '', // formula
      // medicarePartDStartDate: '', // formula
      // cobraStartDate: '', // formula
      // conbraEndDate: '', // formula
      // isDependentDisabled: '', // formula
      // mentalOrPhysical: '', // BQ- formula
      // skipCell_BR: '', // BR
      // skipCell_BS: '', // BS
      // skipCell_BT: '', // BT
      // skipCell_BU: '', // BU
      // skipCell_BV: '', // BV
      // workersComp: '' // BW - ---------------------manual entry
   };

   let excelRows = [];
   if(typeof employees === 'string') employees = JSON.parse(employees);
   for (const emp of employees) {
      let rowData = JSON.parse(JSON.stringify(empTemplateFields));
      const {
         // contactInformation: { zipCode },
         employeeZipCode: zipCode,
         lastName,
         firstName,
         dob,
         age,
         gender,
         employeeClass,
         salary,
         coverageType: { medical: medicalCovType, dental: dentalCovType, vision: visionCovType, life: lifeCovType, std: stdCovType, ltd: ltdCovType },
         ssn
      } = emp;
      rowData.zipCode = zipCode;
      rowData.lastName = lastName;
      rowData.firstName = firstName;
      rowData.dob = dob;
      rowData.age = age;
      rowData.gender = gender;
      rowData.employeeClass = employeeClass;
      rowData.salary = salary;
      rowData.medicalCovType = medicalCovType;
      rowData.dentalCovType = dentalCovType;
      rowData.visionCovType = visionCovType;
      rowData.lifeCovType = lifeCovType;
      rowData.stdCovType = stdCovType;
      rowData.ltdCovType = ltdCovType;
      rowData.waveAllProducts = '';
      rowData.ssn = ssn;

      excelRows.push(rowData);

      if (emp.dependents.length) {
         for (const dep of emp.dependents) {
            let depRowData = JSON.parse(JSON.stringify(rowData));
            const { relationship, lastName, firstName, dob, age, gender, height: heightFeet, weight, disabled: isDependentDisabled, ssn } = dep;
            depRowData.type = 'Dependent';
            depRowData.relationship = relationship;
            depRowData.lastName = lastName;
            depRowData.firstName = firstName;
            depRowData.dob = dob;
            depRowData.age = age;
            depRowData.gender = gender;
            depRowData.employeeClass = '';
            depRowData.heightFeet = heightFeet;
            depRowData.weight = weight;
            depRowData.isDependentDisabled = isDependentDisabled;
            depRowData.ssn = ssn;

            excelRows.push(depRowData);
         }
      }
   }

   return excelRows;
}

function updateSamxOneTemplate(templateData) {
   const sheetData = convertXLsxPopulateAccepetableFormat(templateData);
   return new Promise((resolve, reject) => {
      const templatePath = path.join(__dirname, '../../public/files/samples/SAMx_One_Census_Template_With_Deps.xlsx');
      XlsxPopulate.fromFileAsync(templatePath)
         .then((workbook) => {
            const sheet = workbook.sheet('Employee Info');
            // const headers = Object.keys(templateData[0]);
            // const headerRow = sheet.row(1);
            // headers.forEach((header, index) => {
            //    headerRow.cell(index + 1).value(header);
            // });

            // for (let i = 0; i < templateData.length; i++) {
            //    const row = sheet.row(i + 2);
            //    const rowData = templateData[i];
            //    headers.forEach((header, index) => {
            //       row.cell(index + 1).value(rowData[header]);
            //    });
            // }

            sheet.cell('A4').value(sheetData);

            const outputDir = path.join(__dirname, '../../public/files/output/');
            const outputFileName = `SAMx_One_Census_Template_With_Deps_${new Date().getTime()}.xlsx`;
            const outputPath = path.join(outputDir, outputFileName);
            workbook
               .toFileAsync(outputPath)
               .then(() => {
                  setTimeout(() => {
                     resolve(outputPath);
                  }, 100);
               })
               .catch((err) => {
                  console.error('Error writing file:', err);
                  reject(err);
               });
         })
         .catch((err) => {
            console.error('Error reading file:', err);
            reject(err);
         });
   });
}

function convertXLsxPopulateAccepetableFormat(templateData) {
   let sheetData = [];
   for (const data of templateData) {
      let rowData = [];
      for (const key in data) {
         rowData.push(data[key]);
      }
      sheetData.push(rowData);
   }
   return sheetData;
}

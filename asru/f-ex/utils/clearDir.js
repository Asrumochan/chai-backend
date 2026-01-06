const fs = require('fs').promises;
const path = require('path');

const clearDirectory = async (dirPath = path.join('public/uploads/')) => {
   try {
      console.log('cleaning directry::', dirPath);
      const files = await fs.readdir(path.join(dirPath));
      const now = Date.now();
      const twoHoursInMillis = 2 * 60 * 60 * 1000;
      for (const file of files) {
         const filePath = path.join(dirPath, file);
         const stat = await fs.stat(filePath);
         const fileAge = now - stat.mtimeMs;
         if (stat.isDirectory()) {
            await clearDirectory(filePath); // recursively delete files in subdirectories
         } else if (stat.isFile() && fileAge > twoHoursInMillis) {
            await fs.unlink(filePath);
         }
      }
   } catch (err) {
      console.error('Error reading directory:', err);
   }
};

module.exports = clearDirectory;

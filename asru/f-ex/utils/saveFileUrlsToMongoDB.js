const { userCollection } = require('../config/db');

const saveFileUrlsToMongoDB = async (userId, originalFileUrl, formattedFileUrl, file_name, remarks) => {
   try {
      const result = await userCollection.insertOne({
         userId,
         originalFileUrl,
         formattedFileUrl,
         timestamp: new Date(),
         status: 'InCompleted',
         remarks: remarks,
         file_name: file_name
      });
      uniqueId = result.insertedId.toHexString();
      return uniqueId;
   } catch (err) {
      console.error('Error saving file URLs to MongoDB:', err);
      throw err;
   }
};

module.exports = saveFileUrlsToMongoDB;

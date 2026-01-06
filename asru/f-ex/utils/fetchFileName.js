const { userCollection, ObjectId } = require('../config/db');

const fetchFileName = async (uniqueId) => {
   try {
      const result = await userCollection.findOne({ _id: new ObjectId(uniqueId) });
      if (result) {
         return result.file_name;
      } else {
         console.log('No document found with that ID.');
         return '';
      }
   } catch (err) {
      console.error('Error fetching filename:', err);
   }
};

module.exports = fetchFileName;

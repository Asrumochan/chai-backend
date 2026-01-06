const { decryptQueryParam } = require('../utils');
const { userCollection } = require('../config/db');

const userHistory = async function (req, res, next) {
   let documents = [];
   try {
      const params = decryptQueryParam(decodeURIComponent(req.query.params));
      console.log('params:', params);
      const { msId, isAdmin } = params;
      let query = { userId: msId };
      if (isAdmin == 'true') {
         query = {};
      }

      const ninetyDaysFilter = new Date();
      ninetyDaysFilter.setDate(ninetyDaysFilter.getDate() - 90);
      ninetyDaysFilter.setHours(0, 0, 0, 0); // Set time to the start of the day
      query.timestamp = { $gte: ninetyDaysFilter };

      console.log('query:', query);
      documents = await userCollection.find(query).sort({_id: -1}).toArray();
      documents = documents.map((doc) => {
         return {
            ...doc,
            isGenerateButton: doc.status === 'Completed' // Add the field based on the status value
         };
      });
      // Send the response to the user
      res.send({ message: documents });
   } catch (e) {
      console.error('Error:', e);
      // Send an error response here
      res.status(500).send({ message: 'errorrr' });
   }
};

module.exports = userHistory;

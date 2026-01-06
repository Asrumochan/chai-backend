const { ObjectId } = require('mongodb');
const { userCollection } = require('../config/db');

const updateHistory = async function (req, res) {
   try {
      userCollection.updateOne(
         { _id: new ObjectId(req.body.uniqueId) },
         {
            $set: {
               remarks: req.body.remarks
            }
         }
      );
      res.send({ message: 'Updated successfully' });
   } catch (e) {
      console.error('Error updating MongoDB:', e);
      return res.status(500).send('Internal Server Error');
   }
};

module.exports = updateHistory;

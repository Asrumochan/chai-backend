const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const userCollection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION);

console.log('Connecting to MongoDB...', uri);
console.log('DB_NAME::', process.env.DB_NAME);
console.log('DB_COLLECTION::', process.env.DB_COLLECTION);

async function connectToDatabase() {
   try {
      await client.connect();
      console.log('Connected to MongoDB');
   } catch (err) {
      console.error('Error connecting to MongoDB:', err);
   }
}

module.exports = { client, connectToDatabase, userCollection };

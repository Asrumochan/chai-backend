const { ObjectId } = require('mongodb');
const { client, connectToDatabase, userCollection } = require('./mongoClient');

module.exports = { client, connectToDatabase, userCollection, ObjectId };

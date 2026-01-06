const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
    endpoint: process.env.AWS_ENDPOINT,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1',
    sessionToken: null
 });
 const s3 = new AWS.S3();

 module.exports = s3;
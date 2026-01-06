const CryptoJS = require('crypto-js');
const secretKey = process.env.SECRET_KEY;
// Function to decrypt the query parameter
const decryptQueryParam = (encryptedParam) => {
   const bytes = CryptoJS.AES.decrypt(encryptedParam, secretKey);
   const decrypted = bytes.toString(CryptoJS.enc.Utf8);
   const params = new URLSearchParams(decrypted);
   return Object.fromEntries(params.entries());
};
module.exports = decryptQueryParam;

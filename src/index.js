import connectDB from "../db/index.js";
import dotenv from "dotenv";
/**
import express from "express";
const app = express();

 * 
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (err) => {
      console.error("ERROR: ", err);
      throw err;
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (err) {
    console.error("ERROR: ", err);
    throw err;
  }
})();
*/

dotenv.config({
  path: "./.env",
});

connectDB();

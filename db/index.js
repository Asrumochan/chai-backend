import mongoose from "mongoose";
import { DB_NAME, DB_COLLECTION } from "../src/const.js";
import { MongoClient } from "mongodb";

let userCollection; // Declare at module level to export

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
    return connectionInstance; // Return the client for use in your app
  } catch (err) {
    console.error("ERROR: ", err);
    process.exit(1);
  }
};

export default connectDB;
export { userCollection };

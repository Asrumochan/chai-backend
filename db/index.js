import mongoose from "mongoose";
import { DB_NAME, DB_COLLECTION } from "../src/const.js";
import { MongoClient } from "mongodb";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    const userCollection = client.db(DB_NAME).collection(DB_COLLECTION);

    console.log("Connecting to MongoDB...", uri);
    console.log("DB_NAME::", DB_NAME);
    console.log("DB_COLLECTION::", DB_COLLECTION);
    // const connectionInstance = await mongoose.connect(
    //   `${process.env.MONGODB_URI}`
    // );
    // console.log(
    //   `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    // );
  } catch (err) {
    console.error("ERROR: ", err);
    process.exit(1);
  }
};

export default connectDB;

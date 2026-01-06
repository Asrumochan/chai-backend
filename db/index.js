import mongoose from "mongoose";
import { DB_NAME } from "../src/const.js";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...", process.env.MONGODB_URI);
    const connectionInstance = await mongoose.connect(
      `mongodb+srv://asrumochanparidauhg_db_user:asru12@cluster0.rfzlrdg.mongodb.net/?appName=Cluster0/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;

import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoDBUri = process.env.MONGODB_URI;

  console.log(mongoDBUri);

  if (!mongoDBUri) throw new Error("MongoDB URI is not found in env");

  mongoose.connect(mongoDBUri, {
    dbName: process.env.DB_NAME,
  });
};

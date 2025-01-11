import express, { json } from "express";
import { connectDB } from "./config/database.js";
import dotenv from "dotenv";

dotenv.config();

export const app = express();

app.use(json());

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    console.log(`The Server is listening at port:${PORT}`);
  } catch (error) {
    console.log(
      error?.message || "Something Went Wrong While starting the server!"
    );
  }
};

app.listen(PORT, startServer);

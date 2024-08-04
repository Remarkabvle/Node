import User from "./routes/user.js";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB is connected"))
  .catch(() => console.log("MongoDB is not connected"));


app.use("/user", User);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`${PORT} is listened`));

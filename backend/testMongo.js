require("dotenv").config();
const mongoose = require("mongoose");

const testConnection = async () => {
  try {
    console.log("Attempting to connect with URI:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully connected to MongoDB!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to connect to MongoDB. Error details:");
    console.error(err);
    process.exit(1);
  }
};

testConnection();

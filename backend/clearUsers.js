require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const clearUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
    console.log("All users have been deleted successfully.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

clearUsers();

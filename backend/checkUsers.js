require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    console.log(`Total users in DB: ${users.length}`);
    if (users.length > 0) {
      console.log(`Emails: ${users.map(u => u.email).join(", ")}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();

const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    isPaid: { type: Boolean, default: false },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

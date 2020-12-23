const mongoose = require ("mongoose");

const UserSchema = new mongoose.Schema
(
    {
        name: String,
        email: String,
        password: String,
        status: String,
        score: Number,
        creationDate: Date,
        deactivated: Boolean
    }
);

module.exports = mongoose.model ("User", UserSchema);
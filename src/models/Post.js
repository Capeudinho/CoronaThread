const mongoose = require ("mongoose");
const mongoosePaginate = require ("mongoose-paginate");

const PostSchema = new mongoose.Schema
(
    {
        title: String,
        owner: String,
        creationDate: Date,
        editionDate: Date,
        tags: [String],
        score: Number,
        votes: [Object],
        text: String
    }
);

PostSchema.plugin (mongoosePaginate);
module.exports = mongoose.model ("Post", PostSchema);
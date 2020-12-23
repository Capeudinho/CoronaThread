const mongoose = require ("mongoose");
const mongoosePaginate = require ("mongoose-paginate");

const CommentSchema = new mongoose.Schema
(
    {
        owner: String,
        creationDate: Date,
        editionDate: Date,
        parents: [String],
        score: Number,
        votes: [Object],
        text: String
    }
);

CommentSchema.plugin (mongoosePaginate);
module.exports = mongoose.model ("Comment", CommentSchema);
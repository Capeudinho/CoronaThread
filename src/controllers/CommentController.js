const Comment = require ("../models/Comment");
const User = require ("../models/User");

module.exports =
{
    async list (request, response)
    {
        const comments = await Comment.find ();
        return response.json (comments);
    },

    async listpag (request, response)
    {
        var {post, sort = ""} = request.query;
        if (sort === "date") {var sortValue = {creationDate: 1};}
        else {var sortValue = {score: 1};}
        var comments = await Comment.find ({"parents.0": post}, null, {sort: sortValue});
        comments.sort ((a, b) => parseFloat (a.parents.length)-parseFloat (b.parents.length));
        for (var k = 0; k < comments.length; k++)
        {
            if (comments[k].parents.length > 1)
            {
                for (var j = 0; j < comments.length; j++)
                {
                    if (comments[k].parents[comments[k].parents.length-1] == comments[j]._id)
                    {
                        var index = j;
                        if (k < j) {index--;}
                        const value = comments[k];
                        comments.splice (k, 1);
                        comments.splice (index+1, 0, value);
                        if (k < j && k > 0) {k--;}
                    }
                }
            }
            else
            {
                const value = comments[k];
                comments.splice (k, 1);
                comments.unshift (value);
            }
        }
        await Promise.all
        (
            comments.map
            (
                async (comment, index) =>
                {
                    const owner = await User.findOne ({_id: comment.owner});
                    comments[index] = Object.assign (comment.toObject (), {ownerName: owner.name});
                }
            )
        );
        return response.json (comments);
    },

    async idindex (request, response)
    {
        const {_id} = request.query;
        const comment = await Comment.findById (_id);
        return response.json (comment);
    },

    async store (request, response)
    {
        const {owner = "", parents = [], text = ""} = request.body;
        var creationDate = new Date ();
        var offset = creationDate.getTimezoneOffset ();
        var minutes = creationDate.getMinutes ();
        creationDate.setMinutes (minutes-offset);
        const newComment = await Comment.create ({owner, creationDate, editionDate: null, parents, score: 0, votes: [], text});
        return response.json (newComment);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {owner = "", creationDate = "", editionDate = null, parents = [], score = 0, votes = [], text = ""} = request.body;
        var newComment = await Comment.findByIdAndUpdate (_id, {owner, creationDate, editionDate, parents, score, votes, text}, {new: true});
        const ownerObject = await User.findOne ({_id: newComment.owner});
        newComment = Object.assign (newComment.toObject (), {ownerName: ownerObject.name});
        return response.json (newComment);
    },

    async idupdateedit (request, response)
    {
        const {_id} = request.query;
        const {text = ""} = request.body;
        var editionDate = new Date ();
        var offset = editionDate.getTimezoneOffset ();
        var minutes = editionDate.getMinutes ();
        editionDate.setMinutes (minutes-offset);
        var newComment = await Comment.findByIdAndUpdate (_id, {text, editionDate}, {new: true});
        const owner = await User.findOne ({_id: newComment.owner});
        newComment = Object.assign (newComment.toObject (), {ownerName: owner.name});
        return response.json (newComment);
    },

    async idupdatevote (request, response)
    {
        const {_id} = request.query;
        const {user = "", type = null} = request.body;
        var comment = await Comment.findOne ({_id, "votes.user": user});
        const commentGeneral = await Comment.findById (_id);
        const owner = await User.findOne ({_id: commentGeneral.owner});
        var typeRelation = false;
        if (comment != null)
        {
            for (var k = 0; k < comment.votes.length; k++)
            {
                if (user === comment.votes[k].user && type === comment.votes[k].type)
                {
                    var oldType = comment.votes[k].type;
                    typeRelation = true;
                }
            }
            if (typeRelation === true)
            {
                if (type === true) {var inc = -1;} else {var inc = 1;}
                var newComment = await Comment.findByIdAndUpdate (_id, {$pullAll: {votes: [{user, type: oldType}]}, $inc: {score: inc}}, {new: true});
                await User.findOneAndUpdate ({_id: owner._id}, {$inc: {score: inc}});
                var voteState = null;
            }
            else
            {
                if (type === true) {var inc = 2;} else {var inc = -2;}
                var newComment = await Comment.findOneAndUpdate ({_id, "votes.user": user}, {$set: {"votes.$.type": type}, $inc: {score: inc}}, {new: true});
                await User.findOneAndUpdate ({_id: owner._id}, {$inc: {score: inc}});
                var voteState = type;
            }
        }
        else
        {
            if (type === true) {var inc = 1;} else {var inc = -1;}
            var newComment = await Comment.findByIdAndUpdate (_id, {$push: {votes: {user, type}}, $inc: {score: inc}}, {new: true});
            await User.findOneAndUpdate ({_id: owner._id}, {$inc: {score: inc}});
            var voteState = type;
        }
        newComment = Object.assign (newComment.toObject (), {ownerName: owner.name});
        return response.json ({newComment, voteState});
    },

    async iddestroy (request, response)
    {
        const {_id} = request.query;
        const comment = await Comment.findByIdAndDelete (_id);
        return response.json (comment);
    }
};
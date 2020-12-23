const Post = require ("../models/Post");
const User = require ("../models/User");

module.exports =
{
    async list (request, response)
    {
        const posts = await Post.find ();
        return response.json (posts);
    },

    async listpag (request, response)
    {
        var {page = 1, title = "", user = "", tags = [], sort = "", follow = "any"} = request.query;
        if (title === "") {var titleValue = {$exists: true};}
        else {var titleValue = {$regex: title, $options: "i"};}
        if (user === "") {var ownerValue = {$exists: true};}
        else
        {
            const postOwners = await User.find ({name: {$regex: user, $options: "i"}});
            for (var k = 0; k < postOwners.length; k++)
            {
                postOwners[k] = postOwners[k]._id;
            }
            var ownerValue = {$in: postOwners};
        }
        if (tags.length === 0) {var tagsValue = {$exists: true};}
        else {var tagsValue = {$in: tags};}
        if (sort === "date") {var sortValue = {creationDate: -1};}
        else {var sortValue = {score: -1};}
        if (follow === "any" || follow === []) {followValue = {$exists: true};}
        else {var followValue = {$in: follow};}
        const posts = await Post.paginate ({title: titleValue, owner: ownerValue, owner: followValue, tags: tagsValue}, {sort: sortValue, page, limit: 25});
        await Promise.all
        (
            posts.docs.map
            (
                async (post, index) =>
                {
                    const owner = await User.findOne ({_id: post.owner});
                    posts.docs[index] = Object.assign (post.toObject(), {ownerName: owner.name});
                }
            )
        );
        return response.json (posts);
    },

    async idindex (request, response)
    {
        const {_id} = request.query;
        var post = await Post.findById (_id);
        const owner = await User.findOne ({_id: post.owner});
        post = Object.assign (post.toObject(), {ownerName: owner.name});
        return response.json (post);
    },

    async store (request, response)
    {
        const {title = "", owner = "", tags = [], text = ""} = request.body;
        var creationDate = new Date ();
        var offset = creationDate.getTimezoneOffset ();
        var minutes = creationDate.getMinutes ();
        creationDate.setMinutes (minutes-offset);
        const newPost = await Post.create ({title, owner, creationDate, editionDate: null, tags, score: 0, votes: [], text});
        return response.json (newPost);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {title = "", owner = "", creationDate = "", editionDate = "", tags = [], score = 0, votes = [], text = ""} = request.body;
        var newPost = await post.findByIdAndUpdate (_id, {title, owner, creationDate, editionDate, tags, score, votes, text}, {new: true});
        const ownerObject = await User.findOne ({_id: newPost.owner});
        newPost = Object.assign (newPost.toObject (), {ownerName: ownerObject.name});
        return response.json (newPost);
    },

    async idupdateedit (request, response)
    {
        const {_id} = request.query;
        const {title = "", text = "", tags = []} = request.body;
        var editionDate = new Date ();
        var offset = editionDate.getTimezoneOffset ();
        var minutes = editionDate.getMinutes ();
        editionDate.setMinutes (minutes-offset);
        var newPost = await Post.findByIdAndUpdate (_id, {title, text, tags, editionDate}, {new: true});
        const owner = await User.findOne ({_id: newPost.owner});
        newPost = Object.assign (newPost.toObject (), {ownerName: owner.name});
        return response.json (newPost);
    },

    async idupdatevote (request, response)
    {
        const {_id} = request.query;
        const {user = "", type = null} = request.body;
        var post = await Post.findOne ({_id, "votes.user": user});
        const postGeneral = await Post.findById (_id);
        const owner = await User.findOne ({_id: postGeneral.owner});
        var typeRelation = false;
        if (post != null)
        {
            for (var k = 0; k < post.votes.length; k++)
            {
                if (user === post.votes[k].user && type === post.votes[k].type)
                {
                    var oldType = post.votes[k].type;
                    typeRelation = true;
                }
            }
            if (typeRelation === true)
            {
                if (type === true) {var inc = -1;} else {var inc = 1;}
                var newPost = await Post.findByIdAndUpdate (_id, {$pullAll: {votes: [{user, type: oldType}]}, $inc: {score: inc}}, {new: true});
                await User.findOneAndUpdate ({_id: owner._id}, {$inc: {score: inc}});
                var voteState = null;
            }
            else
            {
                if (type === true) {var inc = 2;} else {var inc = -2;}
                var newPost = await Post.findOneAndUpdate ({_id, "votes.user": user}, {$set: {"votes.$.type": type}, $inc: {score: inc}}, {new: true});
                await User.findOneAndUpdate ({_id: owner._id}, {$inc: {score: inc}});
                var voteState = type;
            }
        }
        else
        {
            if (type === true) {var inc = 1;} else {var inc = -1;}
            var newPost = await Post.findByIdAndUpdate (_id, {$push: {votes: {user, type}}, $inc: {score: inc}}, {new: true});
            await User.findOneAndUpdate ({_id: owner._id}, {$inc: {score: inc}});
            var voteState = type;
        }
        newPost = Object.assign (newPost.toObject (), {ownerName: owner.name});
        return response.json ({newPost, voteState});
    },

    async iddestroy (request, response)
    {
        const {_id} = request.query;
        const post = await Post.findByIdAndDelete (_id);
        return response.json (post);
    }
};
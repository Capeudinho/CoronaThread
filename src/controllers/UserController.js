const User = require ("../models/User");

module.exports =
{
    async list (request, response)
    {
        const users = await User.find ();
        return response.json (users);
    },

    async idindex (request, response)
    {
        const {_id} = request.query;
        const user = await User.findById (_id);
        return response.json (user);
    },

    async loginindex (request, response)
    {
        const {email, password} = request.query;
        const user = await User.findOne ({email, password});
        if (user !== null && user.deactivated === true)
        {
            return response.json ("deactivated");
        }
        return response.json (user);
    },

    async store (request, response)
    {
        const {name = "", email = "", password = ""} = request.body;
        const user = await User.findOne ({email});
        if (user === null)
        {
            var creationDate = new Date ();
            var offset = creationDate.getTimezoneOffset ();
            var minutes = creationDate.getMinutes ();
            creationDate.setMinutes (minutes-offset);
            var newUser = await User.create ({name, email, password, status: "", score: 0, creationDate, deactivated: false});
        }
        return response.json (newUser);
    },

    async idupdate (request, response)
    {
        const {_id} = request.query;
        const {name = "", email = "", password = "", status = ""} = request.body;
        const newUser = await User.findByIdAndUpdate (_id, {name, email, password, status}, {new: true});
        return response.json (newUser);
    },

    async idupdatedeactivate (request, response)
    {
        const {_id} = request.query;
        const newUser = await User.findByIdAndUpdate (_id, {deactivated: true}, {new: true});
        return response.json (newUser);
    },

    async iddestroy (request, response)
    {
        const {_id} = request.query;
        const user = await User.findByIdAndDelete (_id);
        return response.json (user);
    }
};
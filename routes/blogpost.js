const mongoose = require("mongoose")

const postschema = mongoose.Schema({
    content: String,
    comments: [{
        commentUserName: String,
        commentUserPicture: String,
        commentContent: String
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
})

module.exports = mongoose.model("blogpost", postschema)
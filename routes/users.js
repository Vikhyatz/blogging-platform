const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")

mongoose.connect(
  "your mongo db uri")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((e) => {
    console.log("Couldn't connect to MongoDB", e);
  })


const userschema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  profilePicture: String,
  blogPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'blogposts'
  }]
})

userschema.plugin(plm)

module.exports = mongoose.model("user", userschema)

var express = require('express');
var router = express.Router();
var userModel = require("./users")
var postModel = require("./blogpost")
var passport = require("passport")

var localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))


router.get('/', function (req, res) {
  res.render('login');
});

router.post('/register', function (req, res) {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email
  })

  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect('/profilepicture')
      })
    })
})

router.post('/login', passport.authenticate("local", {
  failureRedirect: "/login"
}), function (req, res) {
  res.redirect('/feed')
});

router.get('/register', function (req, res) {
  res.render('register')
})

// username check route to ensure new user does not keep the same username, usernames should be unique
router.get('/usernamecheck/:usernameInp', async function (req, res) {
  const usernameToCheck = req.params.usernameInp;

  const existingUser = await userModel.findOne({
    username: usernameToCheck
  });

  res.json(existingUser);
});

// profile picture route
router.get('/profilepicture', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })

  res.render('profilepicture', { user })
})

// update profile picture
router.post('/updateProfilePicture', async function (req, res) {
  try {
    const pfpUrl = req.body.url;
    const myUserId = req.user._id;

    const updatedUser = await userModel.findByIdAndUpdate(
      myUserId,
      { $set: { profilePicture: pfpUrl } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json('Profile picture set.');
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---


router.get('/feed', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  let allposts = await postModel.find().populate('user')
  res.render('feed', { allposts, user })
})

router.get('/profile', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  res.render('profile', { user })
})

router.get('/createpost', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  res.render('createpost', { user })
})

router.post('/savepost', isLoggedIn, async function (req, res) {
  const postContent = req.body.postContent
  const user = await userModel.findOne({ username: req.session.passport.user })

  const post = await postModel.create({
    content: postContent,
    user: user._id
  })

  user.blogPosts.push(post._id)
  await user.save()

  res.redirect('feed')
})

router.get('/search', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  res.render('search', { user })
})

router.get('/search/:posts', async function (req, res) {
  const postinp = req.params.posts

  const posts = await postModel.find({ content: { $regex: postinp, $options: 'i' } }).populate('user');

  res.json(posts);
})


router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

router.get('/allusers', async function (req, res) {
  let allusers = await userModel.find()
  res.send(allusers)
})

router.get('/allposts', async function (req, res) {
  let allposts = await postModel.find().populate('user')
  res.send(allposts)
})


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect("/")
}

module.exports = router;

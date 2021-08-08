const express = require("express");
const pool = require("./database");
const { format } = require("timeago.js");
const flash = require("connect-flash");
const session = require("express-session");
const MySQLStore = require("express-mysql-session");
const { database } = require("./keys");
const passport = require("passport");
const helpers = require("./lib/helpers");
const _ = require("lodash")

// initializations
const app = express();
require('./lib/auth')

// settings
app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);

// Middleware
app.use(
  session({
    secret: "mysqlsession",
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database),
  })
);
app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

//Global Variables
app.use((req, res, next) => {
  app.locals.success = req.flash("success");
  app.locals.message = req.flash("message");
  app.locals.user = req.user;
  app.locals.format = format;
  next();
});

//ROUTES
//Login Page
app.get("/", helpers.isNotLoggedIn, (req, res) => {
  res.render("login");
});

app.post("/", helpers.isNotLoggedIn, (req,res, next) =>{
  passport.authenticate('local.signin', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
  }) (req,res, next)
});

//Signup Page
app.get("/signup", helpers.isNotLoggedIn ,(req, res) => {
  res.render("signup");
});

app.post("/signup", helpers.isNotLoggedIn, passport.authenticate('local.signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash: true
}));

//Logout
app.get('/logout', helpers.isLoggedIn, (req,res) =>{
  req.logOut();
  res.redirect('/')
})

//Home Page
app.get("/home", async (req, res) => {
  const posts = await pool.query("SELECT posts.title, posts.body, posts.created_at, users.username FROM posts INNER JOIN users ON posts.user_id=users.id");
  res.render("home", { posts: posts});
});

//Compose Page
app.get("/compose", helpers.isLoggedIn ,(req, res) => {
  res.render("compose");
});

app.post("/compose", async (req, res) => {
  const post = {
    title: req.body.postTitle,
    body: req.body.postBody,
    user_id: req.user.id
  };
  await pool.query("INSERT INTO posts set ?", [post]);
  req.flash('success', "Question posted succesfully");
  res.redirect("/home");
});

//Post Page
app.get("/posts/:post", async (req,res) =>{
  const posts = await pool.query("SELECT posts.id, posts.title, posts.body, posts.created_at, users.username FROM posts INNER JOIN users ON posts.user_id=users.id");
  for(post of posts){
    if(_.lowerCase(post.title) == _.lowerCase(req.params.post)){
      const answers = await pool.query("SELECT answers.body, answers.created_at, users.username FROM answers JOIN users ON answers.user_id=users.id where post_id = ?",[post.id])
      res.render("post", {post: post, answers:answers})
    }
  } 
})

//Compose Answer Page
app.get("/answer/:post", helpers.isLoggedIn, (req,res) =>{
  res.render("answer", {postId: req.params.post})
})

app.post("/answer", helpers.isLoggedIn, async (req,res) =>{
  const answer = {
    body: req.body.body,
    post_id: req.body.postId,
    user_id: req.user.id
  }
  await pool.query("INSERT INTO answers set ?", [answer])
  const row = await pool.query("SELECT title FROM posts WHERE id = ?",[answer.post_id])
  res.redirect('/posts/'+row[0].title)
})


app.listen(app.get("port"), () => {
  console.log(`Server running in port ${app.get("port")}`);
});

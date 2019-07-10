const express = require("express");
const app = express();  //initialize express
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

//set cookies
app.use(cookieParser());

//set bodyParser (this needs to come before all our GET routes)
app.use(bodyParser.urlencoded({extended: true}));

//set ejs as the view engine:
app.set("view engine", "ejs");

//all long urls and their generated short URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//all users (from registration page)
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// Routing functions go here

//temporary hompage
app.get("/", function(req, res) {
  res.send("Hello! This is the homepage!");
});

//json object containing our urlDatabase
app.get("/urls.json", function(req, res) {
  res.json(urlDatabase);
})

//random hello function, may delete before submitting project
app.get("/hello", function(req, res) {
  res.send("<html><body><b>Hello</b> this is in HTML</body></html>");
})

//urls page containing the long URLs users have input 
app.get("/urls", function(req, res) {
  let cookie = req.cookies;
  let templateVars = {urls: urlDatabase, user: users[cookie.user_id]};
  res.render("urls_index", templateVars);
})

app.get("/urls/new", function(req, res) {
  let cookie = req.cookies;
  res.render("urls_new", {user: users[cookie.user_id]});
})

app.get("/login", (req, res) => {
  let cookie = req.cookies;
  res.render("login", {user: users[cookie.user_id]});
})

app.get("/register", (req, res) => {
  let cookie = req.cookies;
  res.render("register", {user: users[cookie.user_id]});
})

//place this at the bottom so /urls/new will run:
app.get("/urls/:shortURL", function(req, res) {
  let cookie = req.cookies;
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL];
  res.render("urls_show", {longURL: longURL, shortURL: shortURL, user: users[cookie.user_id]});
})

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const genshortURL = generateRandomString();
  urlDatabase[genshortURL] = req.body.longURL;
  res.redirect(`/urls/${genshortURL}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  res.redirect(`/urls/${short}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let short = req.params.shortURL;
  delete urlDatabase[short];
  res.redirect("/urls");
})

app.post("/login", function(req, res) {
  // if email and password are valid, set the cookie's user_id 
  console.log(req.cookies);
  let userID = checkPassword(req.body.loginemail, req.body.loginpassword);
  if (userID) {
    res.cookie(`user_id`, userID);
  } else {
    res.status(403).send(`Error 403 - Email/ Password entered is not valid!`);
  }
  res.redirect("/urls");
})

app.post("/logout", function(req, res) {
  console.log(req.cookies);
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.post("/register", function(req, res) {
  //if email already in use
  if (req.body.email === ""|| req.body.password === "") {
    res.status(400).send(`Error 400 - Email or password needs to be entered!`);
  //if email or password
  } else if (checkUserEmail(req.body.email)) {
    res.status(400).send(`Error 400 - That email is already in use!`);
  } else {
    let userID = generateRandomString();
    res.cookie(`email`, req.body.email);
    res.cookie(`password`, req.body.password);
    users[userID] = {
      id: userID, 
      email: req.body.email, 
      password: req.body.password
    }
  }
  res.redirect("/urls");
})

app.post("/urls/:shortURL/edit", (req, res) => {
  let short = req.params.shortURL;
  urlDatabase[short] = req.body.longURL;
  res.redirect("/urls");
})

//redirect to longURL link:
app.get("/u/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
})

// Start the server
const PORT = 8080; //default port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//function returns a string of 6 alphanumeric characters
function generateRandomString() {
  var rString = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var result = '';
  for (var i = 0; i < 6; i++) {
    result += rString[Math.floor(Math.random() * rString.length)]
  }
  return result;
}

//returns true if email already exists in database
function checkUserEmail(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}

//check password
function checkPassword(email, password) {
  for (let user in users) {
    if (users[user].email === email && users[user].password === password) {
      return users[user].id;
    }
  }
}
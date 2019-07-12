//import modules:
const express = require("express");
const app = express();  //initialize express
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const {getUserByEmail, checkPassword, isUsersLink, generateRandomString} = require("./helper");

//initializing:
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys:["poop"],
}));

//set ejs as the view engine:
app.set("view engine", "ejs");

//all long urls and their generated short URLs
const urlDatabase = {
  // example of shortened URL
  b6UTxQ: { longURL: "https://www.tsn.ca", date: "10/20/11", numVisits: [], browser:[], userID: "4LKOsL" }
};

//all users (from registration page)
const users = {
  // test user
  "fred": {
    id: "fred",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 8)
  }
};

// Routing functions go here:

// Homepage takes you to your urls if you are logged in or to the login page:
app.get("/", function(req, res) {
  let cookie = req.session;
  let templateVars = {urls: isUsersLink(urlDatabase, cookie.user_id), user: users[cookie.user_id]};
  if (cookie.user_id) { //if logged in
    res.render("urls_index", templateVars);
  } else {  //if not logged in
    res.render("login", templateVars);
  }
});

// Login page
app.get("/login", (req, res) => {
  let cookie = req.session;
  res.render("login", {user: users[cookie.user_id]});
});

// Register account page
app.get("/register", (req, res) => {
  let cookie = req.session;
  res.render("register", {user: users[cookie.user_id]});
});

// Urls page showing user's generated short/ long URLs:
app.get("/urls", function(req, res) {
  let cookie = req.session;
  if (cookie.user_id) {
    let templateVars = {urls: isUsersLink(urlDatabase, cookie.user_id), user: users[cookie.user_id]};
    res.render("urls_index", templateVars);
  } else {
    res.render("login", {user: users[cookie.user_id]});
  }
});

// Generate a new short URL from a long URL
app.get("/urls/new", function(req, res) {
  let cookie = req.session;
  //check if user is logged in
  if (cookie.user_id) {
    res.render("urls_new", {user: users[cookie.user_id]});
  } else {
    res.redirect("/login");
  }
});

// Short url visitors log
app.get("/urls/:shortURL/visits", (req, res) => {
  let cookie = req.session;
  let shortURL = req.params.shortURL;
  let visitorslog = urlDatabase[shortURL].numVisits;
  let uniqueVisitorsLog = urlDatabase[shortURL].browser;
  console.log("hey", visitorslog[0].id, uniqueVisitorsLog);
  res.render("visit", {user: users[cookie.user_id], visitorslog: visitorslog, unique: uniqueVisitorsLog});
})

// Place this at the bottom so /urls/everything else will run:
app.get("/urls/:shortURL", function(req, res) {
  let cookie = req.session;
  let shortURL = req.params.shortURL;
  //check if that short URL was generated:
  if (urlDatabase[shortURL]) {
    let longURL = urlDatabase[req.params.shortURL].longURL;
    res.render("urls_show", {longURL: longURL, shortURL: shortURL, user: users[cookie.user_id]});
  } else {
    res.render("error", {ErrorStatus: 404, ErrorMessage: "Requested page was not found"});
  }
});

// If short URL is clicked, redirect to longURL link:
app.get("/u/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  let cookie = req.session;
  //if no browser cookie has been set:
  if (!cookie.browser) {
    cookie.browser = generateRandomString();
  }
  //if visitor is a user
  if (cookie.user_id) {
    urlDatabase[shortURL].numVisits.push({
        id: `User: ${users[cookie.user_id].id}`,
        timeVisited: new Date()
      });
  //if not a user (not logged in)
  } else {
    req.session.guest_id = generateRandomString();
    urlDatabase[shortURL].numVisits.push({
      id: `Guest: ${req.session.guest_id}`,
      timeVisited: new Date()
    });
  }
  //check if unique visitor
  if (!urlDatabase[shortURL].browser.find((user) => user.id === cookie.browser)) {
    urlDatabase[shortURL].browser.push({
      id: cookie.browser, 
      timeVisited: new Date()
    });
  }
  res.redirect(urlDatabase[shortURL].longURL);
});

// create short url after inputting long url
app.post("/urls", (req, res) => {
  let cookie = req.session;
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const genshortURL = generateRandomString();
  urlDatabase[genshortURL] = {
    longURL: req.body.longURL,
    date: new Date(),
    numVisits: [],
    browser: [],
    userID: cookie.user_id
  };
  res.redirect(`/urls/${genshortURL}`);
});

// when the delete button on the show URL page is pressed
app.delete("/urls/:shortURL/delete", (req, res) => {
  let short = req.params.shortURL;
  let cookie = req.session;
  let userLinks = isUsersLink(urlDatabase, cookie.user_id);
  // if we don't add this, anyone can delete a shortURL from their terminal using curl
  if (userLinks[short]) {
    delete urlDatabase[short];
    res.redirect("/urls");
  } else {
    res.send("You are not authorized to delete this link.");
  }
});

// when the edit buton on the show URL page is pressed
app.put("/urls/:shortURL/edit", (req, res) => {
  let cookie = req.session;
  let short = req.params.shortURL;
  let usersObj = isUsersLink(urlDatabase, cookie.user_id);
  //check if shortURL exists for current user:
  if (usersObj[short]) {
    urlDatabase[short].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.render("error", {ErrorStatus: 403, ErrorMessage: "You do not have access to edit this link."});
  }
});

app.post("/register", function(req, res) {
  //if email or password input is blank throw an error
  if (req.body.email === "" || req.body.password === "") {
    res.render("error", {ErrorStatus: 400, ErrorMessage: "An email or password needs to be entered."});
  //if email is already in use throw an error 
  } else if (getUserByEmail(req.body.email, users)) {
    res.render("error", {ErrorStatus: 400, ErrorMessage: "Oops! That email is already in use!"});
  } else {
    let userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8)
    };
  }
  res.redirect("/urls");
});

app.post("/login", function(req, res) {
  // if email and password are valid, set the cookie's user_id
  // console.log(req.cookies);
  let loginemail = req.body.loginemail;
  let loginpassword = req.body.loginpassword;
  let user = getUserByEmail(loginemail, users); //returns user id
  let passwordCheck = checkPassword(loginemail, loginpassword, users);

  if (user && passwordCheck) {
    // res.cookie(`user_id`, userID);
    req.session.user_id = user;
    req.session.save();
  } else {
    res.render("error", {ErrorStatus: 403, ErrorMessage: "Email/ Password entered is not valid!"});
  }
  res.redirect("/urls");
});

app.post("/logout", function(req, res) {
  // console.log(req.cookies);
  //only clear the user_id cookie, not the browser
  req.session.user_id = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  res.redirect(`/urls/${short}`);
});

app.get("/treasure", (req, res) => {
  let cookie = req.session;
  if (!cookie.user_id || !bcrypt.compareSync("pleasegive", users[cookie.user_id].password)) {
    res.render("error", {ErrorStatus: "No", ErrorMessage: "The treasure does not belong to you"});
  } else {
    res.render("treasure");
  }
})

// Start the server
const PORT = 8080; //default port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
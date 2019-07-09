const express = require("express");
const app = express();  //initialize express
const bodyParser = require("body-parser");

//set bodyParser (this needs to come before all our GET routes)
app.use(bodyParser.urlencoded({extended: true}));

//set ejs as the view engine:
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Routing functions go here
app.get("/", function(req, res) {
  res.send("Hello! This is the homepage!");
});

app.get("/urls.json", function(req, res) {
  res.json(urlDatabase);
})

app.get("/hello", function(req, res) {
  res.send("<html><body><b>Hello</b> this is in HTML</body></html>");
})

app.get("/urls", function(req, res) {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
})

app.get("/urls/new", function(req, res) {
  res.render("urls_new");
})

//place this at the bottom so /urls/new will run:
app.get("/urls/:shortURL", function(req, res) {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL];
  res.render("urls_show", {longURL: longURL, shortURL: shortURL});
})

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const genshortURL = generateRandomString();
  urlDatabase[genshortURL] = req.body.longURL;
  res.redirect(`/urls/${genshortURL}`);
});

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

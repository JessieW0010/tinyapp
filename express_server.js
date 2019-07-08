const express = require("express");
const app = express();  //initialize express

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

// Start the server
const PORT = 8080; //default port 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080


app.set("view engine", "ejs")
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {}

//Generates Random 6 digit Alphanumeric code for short url
function generateRandomString() {
  let randString = ""
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 6; i++) {
    randString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
  }
  return randString
}

app.get("/", (req, res) => {
  res.redirect("/urls")
});

//Deals with new Url Page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

//Deletes a url from the list
app.post("/urls/:id/delete", function (req, res) {
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
});

//Creates a cookie on login
app.post("/urls/login", function (req, res) {
  let cookie = req.body.username
  res.cookie("username", cookie)  //sets a cookie named username to the value of whats entered to sign in
  res.redirect("/urls")
});

//Logs out of website and clears the username cookie
app.post("/urls/logout", function (req, res){
  res.clearCookie("username")
  res.redirect("/urls")
})

//Updates an exist Long url
app.post("/urls/:id/update", function (req,res) {
  urlDatabase[req.params.id] = (req.body.updateURL)
  res.redirect("/urls")
})

//URL Page for specific url
app.get("/urls/:id", function (req, res) {
  let templateVars = {
    shortUrl: req.params.id,
    fullUrl: urlDatabase[req.params.id],
    username: req.cookies["username"]
  }
  res.render("urls_show", templateVars);
});

//List of URL Pages
app.get("/urls", function (req, res) {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  }
  res.render("urls_index", templateVars);
});

//Creates a random short URL for entered url and adds to list
app.post("/urls", (req, res) => {
  let rand = generateRandomString ()
  urlDatabase[rand] = req.body.longURL;
  res.redirect('urls/' + rand);
});
//Sends user to actual long url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
  console.log(res)
});

//REGISTRATION
app.get("/register", function (req, res){
 let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_register", templateVars);
});

// function SearchEmail() {
//   for (var userEmail in users) {
//     console.log(userEmail.email)
//   }
// }
// SearchEmail()

app.post("/register", function (req,res){
  let email = req.body.email
  let password = req.body.password
  if (!email || !password) {            //Handles error if either email or password are blank
    res.statusCode = 400
    res.send('None Shall Pass')
    console.log('Status Code: ', res.statusCode)
  // } else if () {

  } else {
    let rand = generateRandomString ()
    users[rand] = {
      id: rand,
      email: email,
      password: password
    }
    res.cookie("UserID", rand) //Assign cookie email to value of email .... cookie cant handle @ symbol
    res.clearCookie('email')
    res.redirect("/urls")
    console.log("User Database: ", users)
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
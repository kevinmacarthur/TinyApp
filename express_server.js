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

const users = {
  "userID": {
      "id": "randomID",
      "email": "email",
      "password": "password"
    }
  }
//Generates Random 6 digit Alphanumeric code for short url or userID
function generateRandomString() {
  let randString = ""
  let possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  for (let i = 0; i < 6; i++) {
    randString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length))
  }
  return randString
}
//FUNCTION CHECKS IF EMAIL ALREADY EXISTS IN USERS OBJECT
function emailExists(email) {
  for (var userID in users) {
    if (email === users[userID].email) {
      return true;
    }
  }
  return false
}

//Deals with homePage
app.get("/", (req, res) => {
  res.redirect("/urls")
});

//Deals with new Url Page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    userID: req.cookies["UserID"]
  }
  res.render("urls_new", templateVars);
});

//Deletes a url from the list
app.post("/urls/:id/delete", function (req, res) {
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
});

//What happens on LOG In Request
app.post("/urls/login", function (req, res) {
  let email = req.body.email
  let password = req.body.password
  let emailExist = false
  let passwordExist = false
  for (var user in users) {
    if (users[user].email === email){
      emailExist = true
      if(users[user].password === password){
        passwordExist = true
        res.cookie("user_ID", users[user].id)
        res.redirect("/urls")
      }
    }
  }
  // Checking for message to send
  if (!emailExist){
    res.statusCode = 403
    res.send('Error: This account does not exist please register email')
  }
  if (!passwordExist) {
    res.statusCode = 403
    res.send('Error: Incorrect Password')
  }
})


//Handles Login Page
app.get("/urls/login", function (req, res){
 let templateVars = {
    user: users[req.cookies["user_ID"]]
  }
  res.render("urls_login", templateVars);
});

//Logs out of website and clears the username cookie
app.post("/urls/logout", function (req, res){
  res.clearCookie("user_ID")
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
    user: users[req.cookies["user_ID"]],
  }
  res.render("urls_show", templateVars);
});

//List of URL Pages and Homepage
app.get("/urls", function (req, res) {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_ID"]],
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



//REGISTRATION INFORMATION
app.get("/register", function (req, res){
 let templateVars = {
    user: users[req.cookies["UserID"]]
  }
  res.render("urls_register", templateVars);
});

app.post("/register", function (req,res){
  let email = req.body.email
  let password = req.body.password
  if (!email || !password) {            //Handles error if either email or password are blank
    res.statusCode = 400
    res.send('Error: Email or Password are empty')
    console.log('Status Code: ', res.statusCode)
  } else if (emailExists(email)) {       //Handles error if email already exists
    res.statusCode = 400
    res.send('Error: This email has already been registered')
    console.log('Status Code: ', res.statusCode)
  } else {
    let rand = generateRandomString ()
    users[rand] = {
      id: rand,
      email: email,
      password: password
    }
    console.log(users)
    res.cookie("user_ID", rand) //Assign cookie to userID
    res.redirect("/urls")
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
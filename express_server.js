const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

function generateRandomString() {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 6;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * length));
    counter += 1;
  }
  return result;
}

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

app.get("/urls", (req, res) => {
  console.log("cookies: ", req.cookies);
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls/:id/delete", (req,res) => {
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req,res) => {
  const urlID = req.params.id;
  res.redirect(`/urls/${urlID}`);
});

app.get("/register", (req,res) => {
  const templateVars = { username: false };
  res.render("register", templateVars);
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;
  res.redirect('urls'); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/edit", (req,res) => {
  const urlID = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[urlID] = newURL;
  res.redirect(`/urls/${urlID}`);
});

app.post("/login", (req,res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  const username = req.body.username;
  res.clearCookie('username', username);
  res.redirect("/urls");
});

// app.post("/register", (req,res) => {
//   const email = req.body.email;
//   const password = req.body.password;

// });



// LECTURE EXAMPLE
// app.post("/login", (req,res) => {
//   for (let i in users) {
//     if (users[i].email === req.body.email) {
//       if (users[i].password === req.body.pass) {
//         res.cookie('user_id', users[i].id);
//         return res.redirect('/');
//       }
//       return res.send('cannot login, wrong email/pass');
//     }
//   }
//   return res.send('cannot login, wrong email/pass');
// })
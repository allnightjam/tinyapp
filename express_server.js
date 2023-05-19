const express = require("express");
const app = express();
const PORT = 8080; 
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const { getUserByEmail } = require('./helpers.js');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession( {
  name: "session",
  keys: ["user_id"],
}))



function urlsForUser(user) {
  let userURLS = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === user.id) {
      userURLS[urlID] = urlDatabase[urlID];
    }
  }
  return userURLS;
}

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

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "$2a$10$xO9o0DnDc4hWZIXYPhU6V.5oufJcp7EwlA0MjPl/2wHcJfORiTXMK",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$xO9o0DnDc4hWZIXYPhU6V.5oufJcp7EwlA0MjPl/2wHcJfORiTXMK",
  },
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
  const user = users[req.session.user_id]
  if (!user) {
    return res.status(403).send("Please Log In Or Register");
  }
  const urls = urlsForUser(user);
  let templateVars = { urls: urls, user: users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  if  (!user) {
    res.redirect("/login");
  }
  const templateVars = { user: users[req.session.user_id]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("Please Log In Or Register");
  } 
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
   if (!url) {
    return res.status(403).send("URL Not Found");
  }
  if (url.userID !== user.id) {
    return res.status(403).send("Permission Denied");
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;
  if (!urlDatabase[urlID].longURL) {
    return res.send("URL Does Not Exist");
  }
  const longURL = urlDatabase[urlID].longURL;
  res.redirect(longURL);
});

app.get("/urls/:id/delete", (req,res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("You do not have permission");
  }
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req,res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("You do not have permission");
  }
  const urlID = req.params.id;
  res.redirect(`/urls/${urlID}`);
});

app.get("/login", (req,res) => {
  const user = users[req.session.user_id]
  const templateVars = { user: false };
  res.render("login", templateVars);
});

app.get("/register", (req,res) => {
  const user = users[req.session.user_id]
  const templateVars = { user: false };
  res.render("register", templateVars);
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.send("Only Logged In Members Can Shorten URLS");
  }
  let longURL = req.body.longURL;
  let userID = req.session.user_id;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`); 
});

app.post("/urls/:id/edit", (req,res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("You do not have permission");
  }
  const urlID = req.params.id;
  const newURL = req.body.longURL;
  urlDatabase[urlID].longURL = newURL;
  res.redirect(`/urls/${urlID}`);
});


app.post("/login", (req,res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    return res.status(403).send("Email And/Or Password Invalid");
  }
  const passwordMatch = bcrypt.compareSync(req.body.password, user.password); 
  if (passwordMatch) {
    req.session.user_id = user.id;
    return res.redirect('/urls');
  }
  return res.status(403).send("Email And/Or Password Invalid");
});

app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req,res) => {
  const user = getUserByEmail(req.body.email,users);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const newUser = {
    id: generateRandomString(6),
    email: req.body.email,
    password: hashedPassword,
  };
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email And/Or Password Invalid");
  }
  if (user && user.email === newUser.email) {
    return res.status(400).send("Email Taken");
  }
  users[newUser.id] = newUser;
  req.session.user_id = newUser.id
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req,res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("You do not have permission");
  };
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect("/urls");
});

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//convert the request body from a Buffer into string
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.params.id;
  delete urlDatabase[idToDelete];
  res.redirect(`/urls`);
});
app.post("/urls/:id/edit", (req, res) => {
  const urlId = req.params.id;
  const newUrl = req.body.longURL
  urlDatabase[urlId] = newUrl;
  res.redirect(`/urls`);
});

app.get("/urls/:id", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.id)) {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = { searchedValue: req.params.id };
    res.status(404).render("404", templateVars);
  }

});



app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  let shortURL = generateRandomString();
  while (urlDatabase.hasOwnProperty(shortURL)) {
    shortURL = generateRandomString();
  }
  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let result = '';
  const length = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
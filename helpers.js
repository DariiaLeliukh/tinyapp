/*
  Get user by email if exists, otherwise return null
  Input:
    email - the associated email we are looking for
    users - object with different users
  Output
    user object. Example: 
      {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur",
      }
    OR null if user not found
*/
function getUserByEmail(email, users) {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
};

/*
  Generate random String with length of 6 for ID
*/
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

/*
  Filter out only those URLs that are assigned to a specific user
  Input:
    id - user_id passed from the cookie from a logged n user
  Output:
    object filled with URL keys and their values OR empty object
    Example:
    {
      "b2xVn2": {
        longUrl: "http://www.lighthouselabs.ca",
        userId: "userRandomID"
      },
      "9sm5xK": {
        longUrl: "http://www.google.com",
        userId: "user2RandomID"
      },
    }
*/
function urlsForUser(id, urlDatabase) {
  const clearedUrlsDB = {};
  for (const urlID in urlDatabase) {
    if (urlDatabase[urlID].userId === id) {
      clearedUrlsDB[urlID] = urlDatabase[urlID];
    }
  }
  return clearedUrlsDB;
}

module.exports = { getUserByEmail, urlsForUser, generateRandomString };
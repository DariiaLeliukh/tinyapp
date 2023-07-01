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

module.exports = getUserByEmail;
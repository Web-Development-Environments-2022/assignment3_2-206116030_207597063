var express = require("express");
var router = express.Router();
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");


/**
 * Save the new user in the DB 
 * Check that the username is not already exist
 * Hash the user password before saving in the DB
 */
router.post("/Register", async (req, res, next) => {
  try {
    if(!req.body.username || !req.body.firstname || !req.body.lastname|| !req.body.country || !req.body.password|| !req.body.email){
      res.sendStatus(400,"Missing fields to complete register");
      return;
    }
    let user_details = {
      username: req.body.username,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
    }
    let users = [];
    users = await DButils.execQuery("SELECT username from users");

    // check the username does not already exist
    if (users.find((x) => x.username === user_details.username)){
      res.sendStatus(409,"Username taken");
      return;
    }


    // hash the password
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );

    var last_id = await DButils.execQuery(`SELECT MAX(UserID) as id from users`);
    console.log(last_id);
    if (!last_id){
      last_id = 0;
    }
    else{
    last_id = last_id[0]["id"] + 1;
    }
    // save the user details
    await DButils.execQuery(
      `INSERT INTO users VALUES ('${last_id}','${user_details.username}', '${user_details.firstname}', '${user_details.lastname}',
      '${user_details.country}', '${hash_password}', '${user_details.email}')`
    );

    
    res.status(201).send({ message: "user created", success: true });
  } catch (error) {
    console.log(error);
  }
});


/**
 * Start a new session with the user if deatils are valid
 */
router.post("/Login", async (req, res, next) => {
  try {

    // check that username exists
    const users = await DButils.execQuery("SELECT username FROM users");
    if (!users.find((x) => x.username === req.body.username))
      throw { status: 401, message: "Username or Password incorrect" };

    // check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE username = '${req.body.username}'`
      )
    )[0];
    if (!bcrypt.compareSync(req.body.password, user.Passwd)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.user_id = user.UserID;
    req.session.search='no search';


    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    console.log(error);
    next();
  }
});


/**
 * Logout the user and reset the the session
 */
router.post("/Logout", function (req, res) {
  req.session.user_id = undefined;
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "Logout succeeded" });
});

module.exports = router;
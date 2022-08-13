require("dotenv").config();
//#region express configures
var express = require("express");
var path = require("path");
var logger = require("morgan");
const session = require("client-sessions");
const DButils = require("./routes/utils/DButils");
var cors = require('cors')
// Put this statement near the top of your module
var bodyParser = require('body-parser');
var multer = require('multer');
var forms = multer();



// Put these statements before you define any routes.

var app = express();

// apply them

app.use(bodyParser.json());
app.use(forms.array()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger("dev")); //logger
app.use(express.json()); // parse application/json
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(session({
    cookieName: "session", // the cookie key name
    secret: process.env.COOKIE_SECRET, // the encryption key
    duration: 24 * 60 * 60 * 1000, // expired after 20 sec
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration,
    //the session will be extended by activeDuration milliseconds
    cookie: {
      httpOnly: false,
    }
  })
);
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); //To serve static files such as images, CSS files, and JavaScript files
//local:
// app.use(express.static(path.join(__dirname, "dist")));
// remote:
app.use(express.static(path.join(__dirname, '../assignment-3-3-basic/dist')));
app.get("/",function(req,res)
{ 
  //remote: 
  res.sendFile(path.join(__dirname, '../assignment-3-3-basic/dist/index.html'));
  //local:
  // res.sendFile(__dirname+"/index.html");

});

// app.use(cors());
// app.options("*", cors());

const corsConfig = {
  origin: "http://132.73.84.103:8080",
  // origin:true,
  credentials: true
};

app.use(cors(corsConfig));
//need to undo the comment with the origin above and remove the axios cred in the second line in the vue main 
//app.options("*", cors(corsConfig));

// var port = process.env.PORT || "80"; //local=3000 remote=80
//#endregion
const user = require("./routes/user");
const recipes = require("./routes/recipes");
const auth = require("./routes/auth");


//#region cookie middleware
app.use(function (req, res, next) {
  //  req.session.user_id=1;
  //  next();
  console.log("session: " + req.session);
  console.log(req.session.user_id);
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT UserID FROM users")
      .then((users) => {
        if (users.find((x) => x.user_id === req.session.user_id)) {
          req.user_id = req.session.user_id;
          console.log("good session");
        }
        next();
      })
      .catch((error) => next());
  } else {
    next();
    console.log("not good next");
  }
});
//#endregion

// ----> For cheking that our server is alive
app.get("/alive", (req, res) => res.send("I'm alive"));

// Routings
app.use("/user", user);
app.use("/recipes", recipes);
app.use("/auth",auth);

// Default router
app.use(function (err, req, res, next) {
  if(err){
    console.error(err);
    res.status(err.status || 500).send({ message: err.message, success: false });
  }

});



// const server = app.listen(port, () => {
//   console.log(`Server listen on port ${port}`);
// });

// process.on("SIGINT", function () {
//   if (server) {
//     server.close(() => console.log("server closed"));
//   }
//   process.exit();
// });
module.exports = app;

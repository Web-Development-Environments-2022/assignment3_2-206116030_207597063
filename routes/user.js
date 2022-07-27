var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT UserID FROM users").then((users) => {
      if (users.find((x) => x.UserID === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    next()
  }
});


/**
 * Returns the last 3 viewed recipes that were viewed by the logged-in user
 */
 router.get('/viewed3', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id_db = await user_utils.getRecipesDB(user_id,"viewdrecipes");
    const recipes_id_sp = await user_utils.getRecipesSp(user_id,"viewdrecipes");
    var merge_results;
    if(recipes_id_db.length > 0 && recipes_id_sp.length >0){
      merge_results= [recipes_id_db, recipes_id_sp];
      res.status(200).send(merge_results);
    }
    else if(recipes_id_db.length >0 ){
      merge_results = recipes_id_db;

    }
    else{
      merge_results = recipes_id_sp;

    }

    if(merge_results.length >=3){
      let ret=[merge_results[0],merge_results[1],merge_results[2]];
      res.status(200).send(ret);
    }
    else{
      res.status(200).send(merge_results);
    }
  } catch(error){
    console.log(error);
    res.sendStatus(500);

  }
});


/**
 * Returns the viewed recipes id`s that were viewed by the logged-in user
 */
 router.get('/viewed', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getViewedRecipes(user_id);
    res.status(200).send(recipes_id);
  } catch(error){
    console.log(error);
    res.sendStatus(500);
  }
});

/**
 * Saves <user_id, recipe_id> pair in the viewedRecipes table 
 */
router.post('/viewedPost', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsViewed(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as viewed");
    } catch(error){
      console.log(error);
      res.sendStatus(500);

  }
})

/**
 * Saves <user_id, recipe_id> pair in the favoriteRecipes table 
 */
 router.post('/favoritesPost', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id)
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
      console.log(error);
      res.sendStatus(500);

  }
})


/**
 * Returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_id_db = await user_utils.getRecipesDB(user_id,"favoriterecipes");
    const recipes_id_sp = await user_utils.getRecipesSp(user_id,"favoriterecipes");
    if(recipes_id_db.length > 0 && recipes_id_sp.length >0){
      const merge_results= [recipes_id_db, recipes_id_sp];
      res.status(200).send(merge_results);
    }
    else if(recipes_id_db.length >0 ){
      res.status(200).send(recipes_id_db);

    }
    else{
      res.status(200).send(recipes_id_sp);
    }
  } catch(error){
    console.log(error);
    res.sendStatus(500);

  }
});


/**
 * Returnes the previews of the recipes the user has added and saved in the DB
 */
router.get('/myRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const my_recipes = await user_utils.getRecipesDB(user_id, "myrecipes");
    res.status(200).send(my_recipes);
  } catch(error){
    console.log(error);
    res.sendStatus(500);

  }
});




module.exports = router;


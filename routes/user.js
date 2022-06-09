var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

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
 * Returns the viewed recipes that were viewed by the logged-in user
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
router.post('/viewed', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsViewed(user_id,recipe_id)
    res.status(200).send("The Recipe successfully saved as viewed");
    } catch(error){
      console.log(error);
      res.sendStatus(500);

  }
})

/**
 * Saves <user_id, recipe_id> pair in the favoriteRecipes table 
 */
 router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    console.log(user_id);
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
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    const recipes_id_sp = await user_utils.getFavoriteRecipesSp(user_id);
    recipes_id.map((element) => recipes_id_array.push({
      id : element.recipeID,
      title : element.Title,
      image : element.RecipeImage,
      readyInMinutes : element.ReadyInMinutes,
      popularity : element.TotalLikes,
      vegen : element.Vegen,
      vegeterian : element.Vegeterian,
      glutenFree : element.GlutenFree
    })); //extracting the recipe ids from db into array
    recipes_id_sp.map((element) => recipes_id_array.push({
      id : element.id,
      title : element.title,
      image : element.image,
      readyInMinutes : element.readyInMinutes,
      popularity : element.popularity,
      vegen : element.vegan,
      vegeterian : element.vegetarian,
      glutenFree : element.glutenFree
    })); //extracting the recipe ids from sp into array
    res.status(200).send(recipes_id_array);
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
    const recipes_id = await user_utils.getMyRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push({
      id : element.recipeID,
      title : element.Title,
      image : element.RecipeImage,
      readyInMinutes : element.ReadyInMinutes,
      popularity : element.TotalLikes,
      vegen : element.Vegen,
      vegeterian : element.Vegeterian,
      glutenFree : element.GlutenFree
    })); //extracting the recipe ids into array
    res.status(200).send(recipes_id_array);
  } catch(error){
    console.log(error);
    res.sendStatus(500);

  }
});




module.exports = router;


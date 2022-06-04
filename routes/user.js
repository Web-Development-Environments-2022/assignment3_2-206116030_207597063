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
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    next()
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    console.log(req.body);
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    console.log(recipe_id);
    console.log(user_id);
    user_utils.markAsFavorite(user_id,recipe_id).then(res.status(200).send("The Recipe successfully saved as favorite"));
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    console.log(user_id);
    let favorite_recipes = {};
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
    console.log(recipes_id_array);
    res.status(200).send(recipes_id_array);
  } catch(error){
    console.log(error);
  }
});

router.get('/myRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let my_recipes = {};
    let favorite_recipes = {};
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
    console.log(recipes_id_array);
    res.status(200).send(recipes_id_array);
  } catch(error){
    next(error); 
  }
});




module.exports = router;


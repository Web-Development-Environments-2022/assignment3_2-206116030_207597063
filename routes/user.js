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
    var recipes_id_sp = await user_utils.getRecipesSp(user_id,"viewdrecipes");
    if(recipes_id_sp.length <=3){
      res.status(200).send(recipes_id_sp);
    }
    else{
      let len = recipes_id_sp.length 
      let top_3 = [recipes_id_sp[len-1],recipes_id_sp[len-2],recipes_id_sp[len-3]]
      res.status(200).send(top_3);

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
    if(!req.body.recipeId || !req.session.user_id){
      res.sendStatus(400);
      return;
    }
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
    if(!req.body.recipeId || !req.session.user_id){
      res.sendStatus(400);
      return;
    }
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

/**
 * Saves a new recipe in the DB
 */
 router.post("/addRecipe", async (req, res) =>{
  try{
    if(!req.session.user_id || !req.body.title || !req.body.image || !req.body.readyInMinutes|| !req.body.servings || !req.body.analyzedInstructions || !req.body.extendedIngredients){
        res.sendStatus(400,"Missing fields to complete register");
        console.log(req.body);
        console.log(req.session.user_id);
        return;
      }

    var ok = true;
    req.body.extendedIngredients.map((ing) => {
      if(!ing.name || !ing.amount || !ing.unit){
        ok= false;
        return;
      }
    });
    req.body.analyzedInstructions.map((ins) => {
      if(!ins.number || !ins.instruction){
        if(ins.number !=0){
          ok= false;
          return;
        }

      }
    });
    if(!ok){
      res.sendStatus(400,"Missing fields to complete recipe saving");
      return;
    }
    if(!req.body.vegan){
      req.body.vegan=0;
    }
    if(!req.body.vegeterian){
      req.body.vegeterian=0;
    }
    if(!req.body.glutenFree){
      req.body.glutenFree=0;
    }
    var count = await DButils.execQuery("SELECT COUNT(*) as count FROM recipes");
    let recipe_details = {
    userID: req.session.user_id,
    recipeID: 'd'+(count[0]["count"]+1).toString(),
    title: req.body.title,
    recipeImage: req.body.image,
    readyInMinutes: req.body.readyInMinutes,
    totalLikes: '0',
    vegan: req.body.vegan ,
    vegeterian: req.body.vegeterian,
    glutenFree: req.body.glutenFree,
    servings: req.body.servings,
    analyzedInstructions: req.body.analyzedInstructions,
    ingredients: req.body.extendedIngredients,
    pricePerServing: '1'
  }
  //id=id+1;
  let bool = await user_utils.addRecipeToDB(recipe_details);
  if(bool){
    res.status(201).send({ message: "recipe created", success: true });
  }
  else{
    res.sendStatus(400);
  }
} catch (error) {
  res.sendStatus(400);
  console.log(error);

}
})

/**
 * Returnes the previews of the recipes the user has added and saved in the DB
 */
 router.get('/myFamilyRecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let our_family_recipes = await user_utils.getOurFamilyRecipes(user_id);
    console.log(our_family_recipes);
    res.status(200).send(our_family_recipes);
  } catch(error){
    console.log(error);
    res.sendStatus(404);
  }
});




module.exports = router;


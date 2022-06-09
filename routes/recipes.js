var express = require("express");
var router = express.Router();
var id=0; //counter for the users id
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * Returns recipes previews that matches the query
 */
router.get("/search" , async(req, res) => {
  const query = req.query;
  try{
    let search_results= await recipes_utils.search(query);
    res.send(search_results);
  }catch(error){
    res.sendStatus(404);
  }

  
});


/**
 * Returns 3 random recipes previews
 */
router.get("/random", async (req, res , next) => {
  try{
    let random_3_recipes = await recipes_utils.getRandomThreeRecipes();
    res.send(random_3_recipes);
  } catch (error) {
    res.sendStatus(404);

  }
});



/**
 * Saves a new recipe in the DB
 */
router.post("/addRecipe", async (req, res) =>{
  try{
    let recipe_details = {
    userID: req.session.user_id,
    recipeID: 'd'+id,
    title: req.body.title,
    recipeImage: req.body.recipeImage,
    readyInMinutes: req.body.readyInMinutes,
    totalLikes: '0',
    vegen: req.body.vegen,
    vegeterian: req.body.vegeterian,
    glutenFree: req.body.glutenFree,
    servings: req.body.servings,
    analyzedInstructions: req.body.analyzedInstructions,
    ingredients: req.body.ingredients
  }
  id=id+1;
  let bool = await recipes_utils.addRecipeToDB(recipe_details);
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
 * Returns full details of a recipe by id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeFullDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    res.sendStatus(404);
  }
});

module.exports = router;

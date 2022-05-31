var express = require("express");
var router = express.Router();
var id=0;
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * Returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeFullDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * Returns a recipes preview that matches the query
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
 * Returns a 3 random recipes preview
 */
router.get("/random", async (req, res , next) => {
  try{
    let random_3_recipes = await recipes_utils.getRandomThreeRecipes();
    res.send(random_3_recipes);
  } catch (error) {
    next(error);
  }

});

router.post("/addRecipe", async (req, res) =>{
  try{
    let recipe_details = {
    userID: req.session.user_id,
    recipeID: id,
    title: req.body.title,
    recipeImage: req.body.recipeImage,
    readyInMinutes: req.body.readyInMinutes,
    totalLikes: '0',
    vegen: req.body.vegen,
    vegeterian: req.body.vegeterian,
    glutenFree: req.body.glutenFree
  }
  id=id+1;
  await DButils.execQuery(
    `INSERT INTO recipes VALUES ('${recipe_details.recipeID}', '${recipe_details.title}', '${recipe_details.recipeImage}',
    '${recipe_details.readyInMinutes}', '${recipe_details.totalLikes}', '${recipe_details.vegen}', '${recipe_details.vegeterian}','${recipe_details.glutenFree}')`
  );
  await DButils.execQuery(
    `INSERT INTO MyRecipes VALUES ('${recipe_details.userID}', '${recipe_details.recipeID}')`
  );
  res.status(201).send({ message: "recipe created", success: true });
} catch (error) {
  next(error);
}
})

module.exports = router;

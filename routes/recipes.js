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

router.get("/search" , async(req, res) => {
  const query = req.query;
  req.session.search= query;
  try{
    let search_results= await recipes_utils.search(query);
    res.send(search_results);
  }catch(error){
    res.sendStatus(404);
  }

  
});

router.get("/random", async (req, res , next) => {
  try{
    let random_3_recipes = await recipes_utils.getRandomThreeRecipes();
    res.send(random_3_recipes);
  } catch (error) {
    next(error);
  }

    res.send(ret);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});

module.exports = router;
>>>>>>> a438f61a8b36c2e4b601b64bde7e39c517e70473

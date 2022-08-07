var express = require("express");
var router = express.Router();
const DButils = require("../routes/utils/DButils");
//var id=0; //counter for the users id
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");


router.get("/", (req, res) => res.send("im here"));

router.get("/image" , async(req, res) => {
  try{
    res.sendFile("../images/frikase.jpeg");
  }catch(error){
    console.log(error);
    res.sendStatus(404);
  }
});


/**
 * Returns recipes previews that matches the query
 */
router.get("/search" , async(req, res) => {
  const query = req.query;
  req.session.search= query;
  try{
    let search_results= await recipes_utils.search(query);
    res.send(search_results);
  }catch(error){
    console.log(error);
    res.sendStatus(404);
  }

  
});

/**
 * Returns recipes search filters to be saved in the client
 */
 router.get("/searchParam" , async(req, res) => {
  try{
    let ans=[];
    let cuisines=['African', 'American', 'British', 'Cajun', 'Caribbean', 'Chinese', 'Eastern European', 'European', 'French',
    'German', 'Greek', 'Indian', 'Irish', 'Italian', 'Japanese', 'Jewish', 'Korean', 'Latin American', 'Mediterranean',
    'Mexican','Middle Eastern','Nordic','Southern','Spanish','Thai','Vietnamese'];

    let diet= ['Gluten Free','Ketogenic','Vegetarian','Lacto-Vegetarian','Ovo-Vegetarian','Vegan','Pescetarian','Paleo','Primal','Low FODMAP','Whole30'];

    let intolerances = ['Dairy','Egg','Vegetarian','Gluten','Grain','Peanut','Seafood','Sesame','Shellfish','Soy','Sulfite','Tree Nut','Wheat'];

    ans.push(cuisines);
    ans.push(diet);
    ans.push(intolerances);

    res.send(ans);
  }catch(error){
    console.log(error);
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
    console.log(error);
    res.sendStatus(404);

  }
});


/**
 * Saves a new recipe in the DB
 */
router.post("/addRecipe", async (req, res) =>{
  try{
    var count = await DButils.execQuery("SELECT COUNT(*) as count FROM recipes");
    let recipe_details = {
    userID: req.session.user_id,
    recipeID: 'd'+(count[0]["count"]+1).toString(),
    title: req.body.title,
    recipeImage: req.body.recipeImage,
    readyInMinutes: req.body.readyInMinutes,
    totalLikes: '0',
    vegan: req.body.vegan ,
    vegeterian: req.body.vegeterian,
    glutenFree: req.body.glutenFree,
    servings: req.body.servings,
    analyzedInstructions: req.body.analyzedInstructions,
    ingredients: req.body.ingredients,
    pricePerServing: '1'
  }
  //id=id+1;
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
    console.log(req.session);
    console.log(req.session.user_id);


    //if the action done by signed in user then save the recipe as viewed
    if(req.session && req.session.user_id){
      await user_utils.markAsViewed(req.session.user_id,req.params.recipeId);
      console.log("succsess");
    }

    res.send(recipe);
  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }
});

module.exports = router;

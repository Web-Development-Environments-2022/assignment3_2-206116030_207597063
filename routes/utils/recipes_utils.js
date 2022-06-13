const axios = require("axios");
const DButils = require("./DButils");
const api_domain = "https://api.spoonacular.com/recipes";


/**
 * Get recipes list from spooncular response or db and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    if(recipe_id.startsWith('d')){
        const ret = await DButils.execQuery(`select * from recipes where RecipeID='${recipe_id}'`);
        return ret;
    }
    else{
        return await axios.get(`${api_domain}/${recipe_id}/information`, {
            params: {
                includeNutrition: false,
                apiKey: process.env.api_token
            }
        });
    }
     
}


/**
 * Get recipes preview according to the search query from the external API
 * @param {*} query - the query to search with on the external API
 */
async function search(query){
    const name = query.name;
    const amount = query.amount;
    // 5 10 15
    const filter = query.filter;
    // 0 | 1
    const sortBy= query.sort;
    // popularity | time
    var response;

    if( filter == 1 ){
        const cuisine = query.cuisine;
        const diet = query.diet;
        const intolerances = query.intolerances;
        response = await axios.get(`${api_domain}/complexSearch`, {
            params: {
                query:name,
                number: amount ,
                cuisine: cuisine,
                diet: diet,
                intolerances: intolerances,
                sort: sortBy,
                instructionsRequired: true,
                addRecipeInformation: true,
                apiKey: process.env.api_token
            }
        });
    }
    else{
        response = await axios.get(`${api_domain}/complexSearch`, {
            params: {
                query:name,
                number: amount ,
                sort: sortBy,
                instructionsRequired: true,
                addRecipeInformation: true,
                apiKey: process.env.api_token
            }
        });

    }
    let results= response.data.results;
    let previews= getSearchRecipesPreview(results);
    return previews;

}


/**
 * Get recipes list from the search function and return the preview of all the recipes
 * @param {*} recipes - array of recipes which came back from the search query
 */
async function getSearchRecipesPreview(recipes){
    let ret_recipes=[];
    recipes.map((recipe)=>{
        let recipe_details = recipe;
        if(recipe.data){
            recipe_details = recipe.data;
        }
        const{
            id,
            title,
            readyInMinutes,
            image,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree,
            analyzedInstructions
        } = recipe_details;
        ret_recipes.push({
            id: id,
            title: title,
            image: image,
            readyInMinutes: readyInMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,
            analyzedInstructions: analyzedInstructions
    
        });  
    });
    return ret_recipes;

}


/**
 * Gets 20 random recipes from the spooncular api
 */
async function getRandomRecipes(){
    const response = await axios.get(`${api_domain}/random`,{
        params: {
            number: 20,
            apiKey: process.env.api_token
        }
    });
    return response;
}


/**
 * returns a preivew of all the recipes recieved
 * @param {*} recipes - array of recipes from which we will extract and return previews
 */
async function getRecipesPreview(recipes){
    let ret_recipes=[];
    recipes.map((recipe)=>{
        let recipe_details = recipe;
        if(recipe.data){
            recipe_details = recipe.data;
        }
        const{
            id,
            title,
            readyInMinutes,
            image,
            aggregateLikes,
            vegan,
            vegetarian,
            glutenFree
        } = recipe_details;
        ret_recipes.push({
            id: id,
            title: title,
            image: image,
            readyInMinutes: readyInMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree
    
        });  
    });
    return ret_recipes;

}


/**
 * Add a new recipe to the database with all his inforamtions and ingredients
 * Saving user-recipe pair in a different table to know for each user the recipes he added
 * @param {*} recipe_details - json with the new recipe details
 */
async function addRecipeToDB(recipe_details){
    let id = recipe_details.id;
    recipe_details.ingredients.map(async (ing) => await DButils.execQuery(`INSERT INTO ingredients VALUES ('${recipe_details.recipeID}','${ing.name}', '${ing.amount}','${ing.unit}')`));
    await DButils.execQuery(
        `INSERT INTO recipes VALUES ('${recipe_details.recipeID}', '${recipe_details.title}', '${recipe_details.recipeImage}',
        '${recipe_details.readyInMinutes}', '${recipe_details.totalLikes}', '${recipe_details.vegen}', '${recipe_details.vegeterian}','${recipe_details.glutenFree}',
        '${recipe_details.servings}','${recipe_details.analyzedInstructions}')`
      );
    await DButils.execQuery(
        `INSERT INTO myrecipes VALUES ('${recipe_details.userID}', '${recipe_details.recipeID}')`
    );
    return true;
}


/**
 * Gets 3 random recipes from the spooncular api and return them as previwes 
 */
async function getRandomThreeRecipes(){
    let random_recipes= await getRandomRecipes();
    let filtered_recipes= random_recipes.data.recipes.filter((recipe) => (recipe.instructions != "") && (recipe.image && recipe.aggregateLikes && recipe.vegan && recipe.vegetarian && recipe.glutenFree))
    if(filtered_recipes.length < 3 ){
        return getRandomThreeRecipes();
    }
    let preview= await getRecipesPreview([filtered_recipes[0],filtered_recipes[1], filtered_recipes[2]]);
    return preview;
}


/**
 * return recipes full data according to the id entered
 * @param {*} recipe_id - the id of the recipe which we want to get his full details
 */
async function getRecipeFullDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    if(recipe_id.startsWith('d')){
        return recipe_info;
    }
    else return recipe_info.data;
}




exports.getRandomThreeRecipes = getRandomThreeRecipes;
exports.search = search;
exports.getRecipeFullDetails = getRecipeFullDetails;
exports.addRecipeToDB = addRecipeToDB;
exports.getRecipesPreview = getRecipesPreview;
exports.getSearchRecipesPreview = getSearchRecipesPreview;
//exports.getRecipesFromDB = getRecipesFromDB;



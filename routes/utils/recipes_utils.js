const axios = require("axios");
const DButils = require("./DButils");
const api_domain = "https://api.spoonacular.com/recipes";


/**
 * Get recipes list from spooncular response or db and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    if(recipe_id.startsWith('d')){
        const ret = await DButils.execQuery(`select RecipeID as id, Title as title,
         ReadyInMinutes as readyInMinutes, RecipeImage as image, TotalLikes as aggregateLikes, 
         Vegan as vegan, Vegeterian as vegetarian, GlutenFree as glutenFree, Servings as servings, pricePerServing from recipes 
         where RecipeID='${recipe_id}'`);
        const extendedIngredients = await DButils.execQuery(`select original from ingredients where RecipeID='${recipe_id}'`) 
        const analyzedInstructions = await DButils.execQuery(`select number, step from analyzedinstructions where RecipeID='${recipe_id}'`) 
        ret[0]["extendedIngredients"] = extendedIngredients;
        ret[0]["analyzedInstructions"] = analyzedInstructions;
        console.log(ret);
        return ret[0];
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
    var name = "";
    var amount = 5;
    var filter = 0;
    var sortBy = "time";
    if(query.name){
        name = query.name;
    }
    // 5 | 10 | 15
    if(query.amount){
        amount = query.amount;
    }
    // 0 | 1
    if(query.filter){
        filter= query.filter;
    }
    // popularity | time
    if(query.sortBy){
        sortBy = query.sort
    }
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
exports.getRecipesPreview = getRecipesPreview;
exports.getSearchRecipesPreview = getSearchRecipesPreview;



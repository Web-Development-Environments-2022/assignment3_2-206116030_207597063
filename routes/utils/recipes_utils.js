const axios = require("axios");
const DButils = require("./DButils");
const { response } = require("express");
const api_domain = "https://api.spoonacular.com/recipes";


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.api_token
        }
    });
}
async function search(qurey){
    const name = qurey.name;
    const amount = qurey.amount;
    const filter = qurey.filter;

    var response;

    if( filter == 1 ){
        const cuisine = qurey.cuisine;
        const diet = qurey.diet;
        const intolerances = qurey.intolerances;
        response = await axios.get(`${api_domain}/complexSearch`, {
            params: {
                query:name,
                number: amount ,
                cuisine: cuisine,
                diet: diet,
                intolerances: intolerances,
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
                instructionsRequired: true,
                addRecipeInformation: true,
                apiKey: process.env.api_token
            }
        });

    }
    let recipes_ids=[];
    let results= response.data.results;
    console.log(results);
    let previews= getRecipesPreview(results);
    return previews;

}

async function getRandomRecipes(){
    const response = await axios.get(`${api_domain}/random`,{
        params: {
            number: 20,
            apiKey: process.env.api_token
        }
    });
    return response;
}

//need to check this function
async function getRecipesFromDB(recipes){
    let ret=[];
    recipes.map(async (recipe_id)=>{
        console.log("iteration");
        const recipe = await DButils.execQuery(`select * from recipes where ID='${recipe_id}'`);
        console.log(recipe);
        const {
            ID,
            Title,
            ReadyInMinutes,
            RecipeImage,
            TotalLikes,
            Vegen,
            Vegeterian,
            GlutenFree
        } = recipe;
        ret.push({
            id: ID,
            title: Title,
            image: RecipeImage,
            readyInMinutes: ReadyInMinutes,
            popularity: TotalLikes,
            vegan: Vegen,
            vegetarian: Vegeterian,
            glutenFree: GlutenFree
        })
    });
    return ret;
}

async function getRecipesPreview(recipes){
    let ret_recipes=[];
    recipes.map((recipe)=>{
        let recipe_details = recipe;
        console.log(recipe_details);
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

async function addRecipeToDB(recipe_details){
    await DButils.execQuery(
        `INSERT INTO recipes VALUES ('${recipe_details.recipeID}', '${recipe_details.title}', '${recipe_details.recipeImage}',
        '${recipe_details.readyInMinutes}', '${recipe_details.totalLikes}', '${recipe_details.vegen}', '${recipe_details.vegeterian}','${recipe_details.glutenFree}')`
      );
      console.log("passed first insert");
      await DButils.execQuery(
        `INSERT INTO Myrecipes VALUES ('${recipe_details.userID}', '${recipe_details.recipeID}')`
      );
      console.log("passed second insert");
      return true;
}
async function getRandomThreeRecipes(){
    let random_recipes= await getRandomRecipes();
    let filtered_recipes= random_recipes.data.recipes.filter((recipe) => (recipe.instructions != "") && (recipe.image && recipe.aggregateLikes && recipe.vegan && recipe.vegetarian && recipe.glutenFree))
    if(filtered_recipes.length < 3 ){
        return getRandomThreeRecipes();
    }
    let preview= await getRecipesPreview([filtered_recipes[0],filtered_recipes[1], filtered_recipes[2]]);
    return preview;
}

async function getRecipeFullDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    return recipe_info.data;
}

async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}



exports.getRecipeDetails = getRecipeDetails;
exports.getRandomThreeRecipes = getRandomThreeRecipes;
exports.search = search;
exports.getRecipeFullDetails = getRecipeFullDetails;
exports.getRecipesFromDB = getRecipesFromDB;
exports.addRecipeToDB = addRecipeToDB;


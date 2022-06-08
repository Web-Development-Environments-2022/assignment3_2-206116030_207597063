const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const recipes_utils = require("./recipes_utils")


async function getViewedRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select RecipeID from where viewdrecipes UserID='${user_id}'`);
    return recipes_id;
}

async function markAsViewed(user_id, recipe_id){
    await DButils.execQuery(`INSERT INTO viewdrecipes VALUES ('${user_id}','${recipe_id}')`);
}

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`INSERT INTO favoriterecipes VALUES ('${user_id}','${recipe_id}')`);
} 

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(
        `select RecipeID, Title, RecipeImage, ReadyInMinutes, TotalLikes,Vegen, Vegeterian, GlutenFree from
        favoriterecipes inner join recipes on favoriterecipes.RecipeID=recipes.RecipeID where UserID='${user_id}'`);
    return recipes_id;
}

async function getFavoriteRecipesSp(user_id){
    const recipes_id = await DButils.execQuery(
        `select RecipeID from favoriterecipes where favoriterecipes.RecipeID NOT LIKE 'd%'`);
    recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipeID));
    recipes_id_string= recipes_id_array.toString();
    const info = await axios.get(`${api_domain}/informationBulk`, {
        params: {
            ids: recipes_id_string,
            includeNutrition: false,
            apiKey: process.env.api_token
        }
    });
    ret = recipes_utils.getRecipesPreview(info.data);
    return ret;
}

async function getMyRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select RecipeID, Title, RecipeImage, ReadyInMinutes, TotalLikes,Vegen, Vegeterian,
     GlutenFree from myrecipes inner join recipes on myrecipes.RecipeID=recipes.RecipeID where UserID='${user_id}'`);
    return recipes_id;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getMyRecipes = getMyRecipes;
exports.getFavoriteRecipesSp = getFavoriteRecipesSp;
exports.getViewedRecipes = getViewedRecipes;
exports.markAsViewed = markAsViewed;
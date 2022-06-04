const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const recipes_utils = require("./recipes_utils")

async function markAsFavorite(user_id, recipe_id){
    console.log(user_id);
    console.log(recipe_id);
    await DButils.execQuery(`INSERT INTO favoriterecipes VALUES ('${user_id}','${recipe_id}')`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(
        `select recipeID, Title, RecipeImage, ReadyInMinutes, TotalLikes,Vegen, Vegeterian, GlutenFree from
        favoriterecipes inner join recipes on favoriterecipes.RecipeID=recipes.ID where UserID='${user_id}'`);
    return recipes_id;
}


async function getFavoriteRecipesSp(user_id){
    const recipes_id = await DButils.execQuery(
        `select recipeID from favoriterecipes where favoriterecipes.RecipeID NOT LIKE 'd%'`);
    recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipeID));
    recipes_id_string= recipes_id_array.toString();
    console.log('amit' + recipes_id_string);
    const info = await axios.get(`${api_domain}/informationBulk`, {
        params: {
            ids: recipes_id_string,
            includeNutrition: false,
            apiKey: process.env.api_token
        }
    });
    console.log(info.data);
    ret = recipes_utils.getRecipesPreview(info.data);
    //console.log(ret);
    return ret;
}

async function getMyRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipeID, Title, RecipeImage, ReadyInMinutes, TotalLikes,Vegen, Vegeterian,
     GlutenFree from myrecipes inner join recipes on myrecipes.RecipeID=recipes.ID where UserID='${user_id}'`);
    return recipes_id;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getMyRecipes = getMyRecipes;
exports.getFavoriteRecipesSp = getFavoriteRecipesSp;
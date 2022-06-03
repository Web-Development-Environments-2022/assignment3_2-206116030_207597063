const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    console.log(user_id);
    console.log(recipe_id);
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(
        `select recipeID, Title, RecipeImage, ReadyInMinutes, TotalLikes,Vegen, Vegeterian, GlutenFree from
        FavoriteRecipes inner join recipes on FavoriteRecipes.RecipeID=recipes.ID where UserID='${user_id}'`);
    return recipes_id;
}

async function getMyRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipeID, Title, RecipeImage, ReadyInMinutes, TotalLikes,Vegen, Vegeterian,
     GlutenFree from myrecipes inner join recipes on myrecipes.RecipeID=recipes.ID where UserID='${user_id}'`);
    return recipes_id;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getMyRecipes = getMyRecipes;
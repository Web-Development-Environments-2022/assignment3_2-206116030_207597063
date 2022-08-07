const DButils = require("./DButils");
const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const recipes_utils = require("./recipes_utils")

/**
 * returns the ids of the recipes the user has viewed
 * @param {*} user_id - the id of the user we want to get his viewed recipes id
 */
async function getViewedRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select RecipeID from viewdrecipes where UserID='${user_id}'`);
    return recipes_id;
}


/**
 * Saves <user_id,recipe_id> pair in the viewed table in the DB 
 * @param {*} user_id - the id of the user 
 * @param {*} recipe_id - the id of the recipe the user viewed
 */
async function markAsViewed(user_id, recipe_id){
    console.log(user_id);
    console.log(recipe_id);
    const recipes_id = await DButils.execQuery(`select RecipeID from viewdrecipes where UserID='${user_id}'
     AND RecipeID='${recipe_id}'`);
    if(!recipes_id.length){
        await DButils.execQuery(`INSERT INTO viewdrecipes VALUES ('${user_id}','${recipe_id}')`);
        return true;
    }
}


/**
 * Saves <user_id,recipe_id> pair in the favorites table in the DB 
 * @param {*} user_id - the id of the user 
 * @param {*} recipe_id - the id of the recipe the user saved
 */
async function markAsFavorite(user_id, recipe_id){
    console.log("user: "+user_id);
    console.log("recipe: "+recipe_id);
    await DButils.execQuery(`INSERT INTO favoriterecipes VALUES ('${user_id}', '${recipe_id}')`);
    return true;
} 



/**
 * Gets our family recipes from the db
 */
 async function getOurFamilyRecipes(user_id){
    const recipes = await DButils.execQuery(`select family.RecipeID as id, Title as title, 
    ReadyInMinutes as readyInMinutes, RecipeImage as image, Vegan as vegan, Vegeterian as vegeterian, 
    GlutenFree as glutenFree, WhenDoWeEat, ownerRecipe, image1, image2, image3 from familyuser inner join ourfamilyrecipes as family 
    on familyuser.RecipeID=family.RecipeID where UserID='${user_id}'`);

    var recipes_array = [];
    const promises= await Promise.all(recipes.map(async (element) =>{
        recipes_array.push(await familyHelper(element));
    }));

    return recipes_array;   
}

async function familyHelper(element){
    var analyzed = await DButils.execQuery(`select number, step from analyzedinstructions WHERE RecipeID='${element.id}'`);
    var ing = await DButils.execQuery(`select original from ingredients WHERE RecipeID='${element.id}'`);
    let recipe= {
                id: element.id,
                title: element.title,
                image: element.image,
                readyInMinutes: element.readyInMinutes,
                popularity: 0,
                vegan: element.vegan,
                vegetarian: element.vegeterian,
                glutenFree: element.glutenFree,
                analyzedInstructions: analyzed,
                extendedIngredients: ing,
                ownerRecipe: element.ownerRecipe,
                WhenDoWeEat: element.WhenDoWeEat,
                image1: element.image1,
                image2: element.image2,
                image3: element.image3,
    };
    console.log("helper");
    console.log(recipe);
    return recipe;

}


/**
 * returns the preview of the recipes which related to the user_id from one of 3 DB tabels
 * favoritec , viewed and my recipes
 * @param {*} user_id - the id of the user 
 * @param {*} table - the table to take the result from 
 */
 async function getRecipesDB(user_id, table){
    const recipes = await DButils.execQuery(
        `select recipes.RecipeID, Title, RecipeImage, ReadyInMinutes, TotalLikes,Vegan, Vegeterian, GlutenFree from
        ${table} inner join recipes on ${table}.RecipeID=recipes.RecipeID where UserID='${user_id}'`);
    
    let recipes_array = [];
    recipes.map((element) => recipes_array.push({
      id : element.RecipeID,
      title : element.Title,
      image : element.RecipeImage,
      readyInMinutes : element.ReadyInMinutes,
      popularity : element.TotalLikes,
      vegan : element.Vegan,
      vegetarian : element.Vegeterian,
      glutenFree : element.GlutenFree
    })); //extracting the recipe ids from db into array
    return recipes_array;
}


/**
 * returns the preview of the recipes which the user saved in favorites or viewed
 * Only the recipes from spooncular
 * @param {*} user_id - the id of the user 
 */
 async function getRecipesSp(user_id, table){
    const recipes_id = await DButils.execQuery(
        `select RecipeID from ${table} where ${table}.RecipeID NOT LIKE 'd%' and UserID='${user_id}'`);
    recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.RecipeID));
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





exports.markAsFavorite = markAsFavorite;
exports.getViewedRecipes = getViewedRecipes;
exports.getRecipesSp = getRecipesSp;
exports.getRecipesDB = getRecipesDB;
exports.markAsViewed = markAsViewed;
exports.getOurFamilyRecipes = getOurFamilyRecipes;
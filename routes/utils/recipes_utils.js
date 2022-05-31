const axios = require("axios");
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
            apiKey: process.env.spooncular_apiKey
        }
    });
}
async function search(qurey){
    const name = qurey.name;
    const amount = qurey.amount;
    const filter = qurey.filter;
    if( filter === 1 ){
        const cuisine = qurey.cuisine;
        const diet = qurey.diet;
        const intolerances = qurey.intolerances;
        const response = await axios.get(`${api_domain}/complexSearch?`, {
            params: {
                query:name,
                number: amount ,
                cuisine: cuisine,
                diet: diet,
                intolerances: intolerances,
                apiKey: process.env.spooncular_apiKey
            }
        });
    }
    else{
        const response = await axios.get(`${api_domain}/complexSearch?`, {
            params: {
                query:name,
                number: amount ,
                apiKey: process.env.spooncular_apiKey
            }
        });
    }
    return response;

}

async function getRandomRecipes(){
    const response = await axios.get(`${api_domain}/random`,{
        params: {
            number: 10 ,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return response;
}


async function getRecipesPreview(recipes){

    return recipes.map((recipe)=>{
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
        } = data;
        return {
            id: id,
            title: title,
            image: image,
            readyInMinutes: readyInMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree

        }
    });

}
async function getRandomThreeRecipes(){
    let random_recipes= await getRandomRecipes();
    let filtered_recipes= random_recipes.filter((recipe) => (recipe.instructions != "") && (recipe.image && recipe.aggregateLikes && recipe.vegan && recipe.vegetarian && recipe.glutenFree))
    if(filtered_recipes <3 ){
        return getRandomThreeRecipes();
    }
    return getRecipesPreview([filtered_recipes[0],filtered_recipes[1], filtered_recipes[2]]);
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




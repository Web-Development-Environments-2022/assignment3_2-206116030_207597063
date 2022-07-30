
CREATE TABLE Users(
    UserID int NOT NULL,
    Username VARCHAR(255),
    Firstname VARCHAR(255),
    Lastname VARCHAR(255),
    Country VARCHAR(255),
    Passwd VARCHAR(255),
    Email VARCHAR(255),
    PRIMARY KEY(UserID) 
);

CREATE TABLE ourFamilyRecipes(  
    RecipeID INT NOT NULL AUTO_INCREMENT,
    Title VARCHAR(255),
    RecipeImage BLOB,
    ReadyInMinutes VARCHAR(255),
    TotalLikes VARCHAR(255),
    Vegan INT,
    vegeterian INT,
    GlutenFree INT,
    servings INT,
    AnalyzedInstructions VARCHAR(255),
    PRIMARY KEY(RecipeID)
);

CREATE TABLE Family(
    id int NOT NULL AUTO_INCREMENT,
    ownRecipe VARCHAR(255),
    RecipeImage VARCHAR(255),
    whenPrepared VARCHAR(255),
    ingredients VARCHAR(255),
    AnalyzedInstructions VARCHAR(255),
    servings INT,
    Vegan VARCHAR(255),
    vegeterian VARCHAR(255),
    GlutenFree VARCHAR(255),
    PRIMARY KEY(id)
);

CREATE TABLE Recipes(
    RecipeID VARCHAR(255) NOT NULL,
    Title VARCHAR(255),
    RecipeImage VARCHAR(255),
    ReadyInMinutes VARCHAR(255),
    TotalLikes VARCHAR(255),
    Vegan INT,
    Vegeterian INT,
    GlutenFree INT,
    Servings INT,
    pricePerServing VARCHAR(255),
    PRIMARY KEY(RecipeID) 
);

CREATE TABLE FavoriteRecipes(
    UserID int NOT NULL,
    RecipeID VARCHAR(255) NOT NULL,
    PRIMARY KEY(UserID,RecipeID) 
);

CREATE TABLE MyRecipes(
    UserID int NOT NULL,
    RecipeID VARCHAR(255) NOT NULL,
    PRIMARY KEY(UserID,RecipeID) 
);

CREATE TABLE ViewdRecipes(
    UserID int NOT NULL,
    RecipeID VARCHAR(255) NOT NULL,
    PRIMARY KEY(UserID,RecipeID) 
);

CREATE TABLE Ingredients(
    RecipeID VARCHAR(255) NOT NULL,
    IngrName VARCHAR(255) NOT NULL,
    Amount INT,
    Unit VARCHAR(255),
    original VARCHAR(255),
    PRIMARY KEY(RecipeID,IngrName) 
);

CREATE TABLE analyzedInstructions(
    RecipeID VARCHAR(255) NOT NULL,
    number INT NOT NULL,
    step VARCHAR(255),
    PRIMARY KEY(RecipeID,number) 
);
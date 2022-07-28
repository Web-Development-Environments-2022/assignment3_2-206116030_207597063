
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

CREATE TABLE Recipes(
    RecipeID VARCHAR(255) NOT NULL,
    Title VARCHAR(255),
    RecipeImage Blob,
    ReadyInMinutes VARCHAR(255),
    TotalLikes VARCHAR(255),
    Vegen INT,
    Vegeterian INT,
    GlutenFree INT,
    Servings INT,
    AnalyzedInstructions VARCHAR(255),
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
    PRIMARY KEY(RecipeID,IngrName) 

);
CREATE TABLE users(
    ID int NOT NULL,
    Username VARCHAR(255),
    Firstname VARCHAR(255),
    Lastname VARCHAR(255),
    Country VARCHAR(255),
    Passwd VARCHAR(255),
    Email VARCHAR(255),
    PRIMARY KEY(ID) 
);
CREATE TABLE recipes(
    ID int NOT NULL,
    Title VARCHAR(255),
    RecipeImage Blob,
    ReadyInMinutes VARCHAR(255),
    TotalLikes VARCHAR(255),
    Vegen VARCHAR(255),
    Vegeterian VARCHAR(255),
    GlutenFree VARCHAR(255),
    PRIMARY KEY(ID) 
);

CREATE TABLE FavoriteRecipes(
    UserID int NOT NULL,
    RecipeID int NOT NULL,
    PRIMARY KEY(UserID,RecipeID) 
);

CREATE TABLE MyRecipes(
    UserID int NOT NULL,
    RecipeID int NOT NULL,
    PRIMARY KEY(UserID,RecipeID) 
);

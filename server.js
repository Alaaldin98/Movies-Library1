'use strict';
const express = require("express");
const recipes = require("./data.json");
const app = express();

function Recipe(title,poster_path,overview ){
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
};
app.get(`/`,dataHandler);
app.get(`/favorite`,favoriteHandler);
app.use("*", notFoundHandler);
app.use("*", errorHandler);

function dataHandler(req, res){
    let result = [];
    recipes.data.forEach((value) => {
        let oneRecipe = new Recipe(value.title, value.poster_path,value.overview);
        result.push(oneRecipe);
    });
    return res.status(200).json(result);
};

function favoriteHandler(request, response){
    
    return response.send("Welcome to Favorite Page");
};

function notFoundHandler(req, res){
    return res.status(404).send("Not Found");
}

function errorHandler(error,req,res){
    const err = {
        status : 500,
        message : error
    }
    return res.status(500).send(err);
}

app.listen(3000, () => {
    console.log("Listen on 3000");
});
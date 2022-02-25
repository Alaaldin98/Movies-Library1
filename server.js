'use strict';
const express = require("express");
const recipes = require("./data.json");
const app = express();
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();
const APIKEY = process.env.APIKEY;
const PORT = process.env.PORT;


function Recipe(title,poster_path,overview ){
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
};
app.get(`/`,dataHandler);
app.get(`/favorite`,favoriteHandler);
app.get(`/trending`,trendingHandler);
app.use("*", notFoundHandler);
app.use("*", errorHandler);
app.get("/search", searchRecipesHandler)


function dataHandler(req, res){
    let result = [];
    recipes.data.forEach((value) => {
        let oneRecipe = new Recipe(value.title, value.poster_path,value.overview);
        result.push(oneRecipe);
    });
    return res.status(200).json(result);
};

function trendingHandler(req, res){
    let result = [];
    axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`)
    .then(apiResponse => {
        apiResponse.data.recipes.map(value => {
            let oneRecipe = new Recipe(value.id,value.title,value.release_date, value.poster_path,value.overview);
            result.push(oneRecipe);
        })
        return res.status(200).json(result);
    }).catch(error => {
        errorHandler(error, req, res);
    })    
};

function searchRecipesHandler(req, res){
    const search = req.query.recipe
    let results = [];
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&language=en-US&query=${search}`)
    .then(apiResponse=>{
        apiResponse.data.results.map(value => {
            let oneRecipe = new Recipe(value.id || "N/A", value.title || "N/A", value.readyInMinutes || "N/A", value.vegetarian || "N/A", value.sourceUrl || "N/A", value.image || "N/A", value.summary || "N/A", value.instructions || "N/A")
            results.push(oneRecipe);
        });
        return res.status(200).json(results);
    }).catch(error => {
        errorHandler(error, req, res);
    })

}



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

app.listen(PORT, () => {
    console.log(`Listen on ${PORT}`);
});
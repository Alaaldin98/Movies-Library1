'use strict';
const express = require("express");
const recipes = require("./data.json");
const app = express();
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config();
const APIKEY = process.env.APIKEY;
const PORT = process.env.PORT;
// const DATABASE_URL = process.env.DATABASE_URL;
const pg = require("pg");

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

function Recipe(title,poster_path,overview ){
    this.title = title;
    this.poster_path = poster_path;
    this.overview = overview;
};


function addMovie(id,title,release_date,poster_path,overview){
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
};
app.use(express.json());
app.post("/addMovie", addMovieHandler);
app.get("/favMovie", favMovieHandler);

app.get(`/`,dataHandler);
app.get(`/favorite`,favoriteHandler);
app.get(`/trending`,trendingHandler);
app.get(`/top_rated`,top_rated);
app.get(`/now_playing`,now_playing);

app.get("/getMovie/:id", favRecipeHandler)
app.put("/UPDATE/:id", updateFavRecipeHandler);
app.delete("/DELETE/:id", deleteFavRecipeHandler);

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
            let oneRecipe = new addMovie(value.id,value.title,value.release_date, value.poster_path,value.overview);
            result.push(oneRecipe);
        })
    
        return res.status(200).json(result);
    }).catch(error => {
        errorHandler(error, req, res);
    })    
};

function top_rated(req, res){
    let result = [];
    axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${APIKEY}`)
    .then(apiResponse => {
        apiResponse.data.recipes.map(value => {
            let oneRecipe = new addMovie(value.id,value.title,value.release_date, value.poster_path,value.overview);
            result.push(oneRecipe);
        })
    
        return res.status(200).json(result);
    })
    .catch(error => {
        errorHandler(error, req, res);
    })    
};
function now_playing(req, res){
    let result = [];
    axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${APIKEY}`)
    .then(apiResponse => {
        apiResponse.data.recipes.map(value => {
            let oneRecipe = new addMovie(value.id,value.title,value.release_date, value.poster_path,value.overview);
            result.push(oneRecipe);
        })
    
        return res.status(200).json(result);
    })
    .catch(error => {
        errorHandler(error, req, res);
    })    
};

function searchRecipesHandler(req, res){
    const search = req.query.recipe
    let results = [];
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&language=en-US&query=${search}`)
    .then(apiResponse=>{
        apiResponse.data.results.map(value => {
            let oneRecipe = new addMovie(value.id || "N/A", value.title || "N/A", value.release_date || "N/A", value.poster_path || "N/A", value.overview || "N/A")
            results.push(oneRecipe);
        });
        return res.status(200).json(results);
    }).catch(error => {
        errorHandler(error, req, res);
    })

}

function addMovieHandler(req, res){
    const recipe = req.body;

    const sql = `INSERT INTO favmovie(id,title,release_date,poster_path,overview) VALUES($1, $2, $3, $4, $5) RETURNING *`
    const values = [recipe.id, recipe.title, recipe.release_date, recipe.poster_path, recipe.overview]
    client.query(sql, values).then((result)=>{
        return res.status(201).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
};
function favMovieHandler(req, res){
    const sql = `SELECT * FROM addmovie`;

    client.query(sql).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
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
function updateFavRecipeHandler(req, res){
    const id = req.params.id;
    const recipe = req.body;
   
    const sql = `UPDATE favmovie SET  overview=$1, title=$2,release_date=$3, poster_path=$4, WHERE id=$1 RETURNING *;`;
    const values = [recipe.id, recipe.title, recipe.release_date, recipe.poster_path, recipe.overview];

    client.query(sql, values).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    })

};

function deleteFavRecipeHandler(req, res){
    const id = req.params.id

    const sql = `DELETE FROM favmovie WHERE id=$1;`
    const values = [id];

    client.query(sql, values).then(() => {
        return res.status(204).json({})
    }).catch(error => {
        errorHandler(error, req, res);
    })
};

function favRecipeHandler(req, res){
    let id = req.params.id;
    
    const sql = `SELECT * FROM favmovie WHERE id=$1;`;
    const values = [id];

    client.query(sql, values).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res)
    })
};


client.connect()
.then(() => {
    app.listen(PORT, () => {
        console.log(`Listen on ${PORT}`);
    });
});
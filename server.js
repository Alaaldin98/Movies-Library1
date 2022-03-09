'use strict'

const express = require("express");

const movies = require("./data.json");
const dotenv = require("dotenv");
const axios = require("axios");
const pg = require("pg");
const cors = require("cors");


dotenv.config();

const app = express();

app.use(cors());

const APIKEY = process.env.APIKEY;
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// const client = new pg.Client(DATABASE_URL);

const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

function Movie(id, title, release_date, poster_path, overview) {

    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;

};

app.use(express.json());




app.get('/', homeHandler);

app.get('/favorite', favoriteHandler);

app.get('/trending', trendingHandler);

app.get('/search', searchHandler);

app.get('/review', reviewHandler);

app.get('/watch', watchHandler);

app.post('/addMovie', addMovieHandler);

app.get('/getMovie', getMovieHandler);

app.put("/UPDATE/:id", updateHandler);

app.delete("/DELETE/:id", deleteHandler);

app.get("/getMovie/:id", getMovieIdHandler)

app.use("*", notFoundHandler);

app.use(errorHandler);

function updateHandler(req, res) {
    const id = req.params.id;
    const movie = req.body;

    console.log(movie);
    const sql = `UPDATE movieTable SET title=$1, release_date=$2 , poster_path=$3 , overview=$4 , comments=$5 WHERE id=$6 RETURNING *;`;
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview, movie.comments, id];

    client.query(sql, values).then((result) => {
        return res.status(200).json(result);
    }).catch((error) => {
        errorHandler(error, req, res);
    })
   

};

function deleteHandler(req, res) {
    const id = req.params.id

    const sql = `DELETE FROM movieTable WHERE id=$1;`
    const values = [id];

    client.query(sql, values).then(() => {
        return res.status(204).json({})
    }).catch(error => {
        errorHandler(error, req, res);
    })
};

function getMovieIdHandler(req, res) {
    let id = req.params.id;

    const sql = `SELECT * FROM movieTable WHERE id=$1;`;
    const values = [id];

    client.query(sql, values).then((result) => {
        return res.status(200).json(result);
    }).catch((error) => {
        errorHandler(error, req, res)
    })
};


function addMovieHandler(req, res) {
    const movie = req.body;
    console.log(movie);
    const sql = `INSERT INTO movieTable(title, release_date, poster_path , overview , comments) VALUES($1, $2, $3, $4, $5) RETURNING *`
    const values = [movie.title, movie.release_date, movie.poster_path, movie.overview, movie.comments]
    client.query(sql, values).then((result) => {
        return res.status(201).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });


};

function getMovieHandler(req, res) {
    const sql = `SELECT * FROM movieTable`;

    client.query(sql).then((result) => {
        return res.status(200).json(result.rows);
    }).catch((error) => {
        errorHandler(error, req, res);
    });
};

function trendingHandler(req, res) {

    let result = [];

    axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                let theMovie = new Movie(value.id, value.title, value.release_date, value.poster_path, value.overview);
                result.push(theMovie);
            })
            return res.status(200).json(result);
        }).catch(error => {
            errorHandler(error, req, res);
        })



};

function searchHandler(request, response) {
    const searching = request.query.original_title;
    let arr = [];
    axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&language=en-US&query=${searching}&include_adult=false`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                let theMovie = new Movie(value.id, value.title, value.release_date, value.poster_path, value.overview);
                arr.push(theMovie);

            })

            return response.status(200).json(arr);

        }).catch(error => {
            errorHandler(error, request, response);
        })


}

function reviewHandler(req, res) {
    let reviewId = req.query.id;
    //58aa82f09251416f92006a3a   <- USE THIS ID

    let result = [];

    axios.get(`https://api.themoviedb.org/3/review/${reviewId}?api_key=${APIKEY}`)
        .then(apiResponse => {
            console.log(apiResponse);


            let response = new Movie(apiResponse.data.id, apiResponse.data.author, apiResponse.data.author_details, apiResponse.data.content, apiResponse.data.overview);




            return res.status(200).json(response);
        }).catch(error => {
            errorHandler(error, req, res);
        })



};



function watchHandler(req, res) {

    let result = [];

    axios.get(`https://api.themoviedb.org/3/watch/providers/regions?api_key=${APIKEY}&language=en-US`)
        .then(apiResponse => {
            apiResponse.data.results.map(value => {
                let theMovie = new Movie(value.iso_3166_1, value.english_name);
                result.push(theMovie);
            })
            return res.status(200).json(result);
        }).catch(error => {
            errorHandler(error, req, res);

        })

};





function homeHandler(request, response) {



    let Summary = new Movie(movies.title, movies.poster_path, movies.overview);


    return response.status(200).json(Summary);

}

function favoriteHandler(req, res) {

    return res.send("Welcome to Favorite Page");

}



function errorHandler(error, requesting, responsing) {
    const err = {
        status: 500,
        message: error.message
    }
    return responsing.status(500).send(err);
}

function notFoundHandler(requesting, responsing) {
    return responsing.status(404).send("Not Found");
}




client.connect();

app.listen(PORT, () => {
    console.log(`Listen on ${PORT}`);
});

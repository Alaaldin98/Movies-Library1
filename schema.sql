CREATE TABLE IF NOT EXISTS favmovie(
id SERIAL PRIMARY KEY,
title VARCHAR(255),
release_date INTEGER,
poster_path VARCHAR(500),
overview VARCHAR(10000)
);
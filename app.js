const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

module.exports = app;

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT 
            movie_name as movieName
        FROM 
            movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
        INSERT INTO 
            movie (director_id,movie_name, lead_actor)
        VALUES
            (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
          SELECT
              movie_id as movieId,
              director_id as directorId,
              movie_name as movieName,
              lead_actor as leadActor
          FROM
              movie
          WHERE
              movie_id = ${movieId};`;
  const movie = await db.all(getMovieQuery);
  response.send(movie[0]);
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
        UPDATE 
            movie 
        SET 
            director_id = '${directorId}',
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE 
            movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetails = `
        DELETE FROM
            movie
        WHERE
            movie_id = ${movieId};`;
  await db.run(deleteMovieDetails);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
        SELECT 
            director_id as directorId,
            director_name as directorName
        FROM 
            director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
          SELECT
              movie_name as movieName
          FROM
              movie
          WHERE
              director_id = ${directorId};`;
  const director = await db.all(getDirectorQuery);
  response.send(director);
});

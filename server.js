'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//custom imports
// const movies = require('./seed-data');
// const recipes = require('./recipe-seed-data');
const { MovieModel, RecipeModel } = require('./models');

const { DATABASE_URL, PORT } = require('./config');
console.log(DATABASE_URL);

// 1)XPull movies and recipes from database now instead of seed-data files
// 2) Create HTML app views and populate with db data
// 3) -- Get images from Yelp
// 4) Implement some tests


const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));    //provides hook to all of the static files in public directory

app.get('/movies', (req, res) => {
  MovieModel
    .find()
    .then(movies => {
      // console.log(movies);
      res.json(movies);
    });
});

app.get('/cuisines', (req, res) => {
  MovieModel
    .find()
    .then(movies => {
      const cuisine = movies.map(movie => movie.pairedCuisine);
      res.json(cuisine);
    });

});

//display all of the recipes
app.get('/recipes', (req, res) => {
  RecipeModel
    .find()
    .then(recipes => res.json(recipes));
});

//display the recipe for the id provided from req.params.id
app.get('/recipes/:id', (req, res) => {
  RecipeModel
    .findById(req.params.id)
    .then(recipes => res.json(recipes));
});


app.post('/recipes', (req, res) => {
  RecipeModel
    .create({ 'firstName': req.body.firstName, 'email': req.body.email, 'zip': req.body.zip })
    .then(created => {
      console.log(created);
      res.json(created);
    });
});

//after detail submit, update document
app.put('/recipes/:id', (req, res) => {
  RecipeModel
    .findByIdAndUpdate(req.params.id, { $set: { 'ratingComment': req.body.ratingComment, 'rating': req.body.rating } }, { new: true })
    .then(updated => {
      console.log(updated);
      // res.json(updated);
    });
  //respond with entire database
  RecipeModel
    .find()
    .then(recipes => res.json(recipes));
});

app.delete('/recipes/:id', (req, res) => {
  RecipeModel
    .findOneAndRemove({ _id: req.params.id })
    .then(deleted => {
      console.log(deleted);
      res.status(202).json(deleted);
    });
  // res.send('deleted');
});

let server;

function runServer(database_url, port) {
  return new Promise((resolve, reject) => {
    mongoose.connect(database_url, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL, PORT).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };





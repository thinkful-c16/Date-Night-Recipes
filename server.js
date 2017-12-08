'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
mongoose.Promise = global.Promise;

//custom imports
// const movies = require('./seed-data');
// const recipes = require('./recipe-seed-data');
const { MovieModel, RecipeModel } = require('./models');

const { DATABASE_URL, PORT } = require('./config');
//console.log(DATABASE_URL);

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

// app.post('/movies', (req, res) => {
//   res.json(movies);
// });

app.get('/movies/:id', (req, res) => {
  MovieModel
    .findById(req.params.id)
    .then(movie => {
      res.json(movie);
    });
});

// Yelp API proxy 
app.get('/yelp/search', (req, res) => {
  const AUTH_TOKEN = 'Bearer wEUb-VMxE0zsWNBtO7LFTg5STUEX9ERbvKK4eAZu0h_3GG0WwXNKVAxTmU6Pq4jHvw55RsXQyYxnWxIaS9aCl_if0U35m0tZXlP7FpoHWy6td-fUUVgi10-u-nclWnYx';
  const { zip, cuisine } = req.query;
  const searchString = `https://api.yelp.com/v3/businesses/search?location=${zip}&term=${cuisine}&limit=5`;
  axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
  axios
    .get(searchString)
    .then(yelpRes => {
      //console.log(yelpRes.data.businesses);
      res.status(200).json(yelpRes.data.businesses);
    })
    .catch(err => {
      console.log(err);
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
  //console.log(req.params);
  RecipeModel
    .findById(req.params.id)
    .then(recipe => {
      //console.log(recipe);
      res.json(recipe);
    });
});


app.post('/recipes', (req, res) => {
  // const requiredFields = ['firstName', 'email', 'zip'];
  // for (let i = 0; i < requiredFields.length; i++) {
  //   const field = requiredFields[i];
  //   if (!(field in req.body)) {
  //     const message = `Missing \`${field}\` in request body`;
  //     console.error(message);
  //     return res.status(400).send(message);
  //   }
  // }
  RecipeModel
    .create({ 'firstName': req.body.firstName, 'email': req.body.email, 'zip': req.body.zip })
    .then(created => {
      res.status(201).json(created);
      // .catch(err => {
      //   console.error(err);
      //   res.status(500).json({ message: 'Internal Server Error' });
      // });
    });
});

//after selecting restaurant, update document (before date night)
app.put('/recipes/:id', (req, res) => {
  //console.log('line 103', req.body);
  RecipeModel
    .findByIdAndUpdate(req.params.id, {
      $set: {
        'movieId': req.body.movieId,
        'restaurantId': req.body.restaurantId
        // 'ratingComment': req.body.ratingComment, 
        // 'rating': req.body.rating 
      }
    }, { new: true })
    .then(updated => {
      console.log('line 112', updated);
      res.status(200).json(updated);
    });
  //respond with entire database
  // RecipeModel
  //   .find()
  //   .then(recipes => res.status(204).json(recipes).end());
  // .catch(err => {
  //   console.log(err);
  //   res.status(500).send({ error: 'Internal Server Error' });
  // });
});

//after reviewing recipe, update document (after date night)
app.put('/recipes/reviews/:id', (req, res) => {
  RecipeModel
    .findByIdAndUpdate(req.params.id, {
      $set: {
        'ratingComment': req.body.ratingComment,
        'rating': req.body.rating
      }
    }, { new: true })
    .then(updated => {
      //console.log(updated);
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
    .then(() => {
      res.status(204).json({ message: 'recipe deleted' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Server Error' });
    });
});

//Catch all endpoint for request to non-existent endpoint
app.use('*', function (req, res) {
  res.status(404).json({ message: 'Endpoint Not Found' });
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





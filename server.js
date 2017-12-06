'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

//custom imports
const movies = require('./seed-data');
const recipes = require('./recipe-seed-data'); 

//const { DATABASE_URL } = require('./config');
// console.log(DATABASE_URL);

// 1) Pull movies and recipes from database now instead of seed-data files
// 2) Create HTML app views and populate with db data
// 3) -- Get images from Yelp
// 4) Implement some tests


const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));    //provides hook to all of the static files in public directory

app.get('/movies', (req, res) => {
  res.json(movies);
});

app.get('/movies/:id', (req, res) => {
  res.json(movies[req.params.id]);
});

// ### Backend
// app.get('/yelp/search', (req, res) => {
//   const {zip, cuisine} = req.query;
//   const searchString = `https://api.yelp.com/.../search?location=${zip}&cuisine=${cuisine}`;
//   axios
//   .headers({})
//   .get(searchString)
//   .then(yelpRes => {
//     res.status(200).send(yelpRes);
//   })
// });


// Yelp API proxy 
app.get('/yelp/search', (req, res) => {
  const AUTH_TOKEN = 'Bearer wEUb-VMxE0zsWNBtO7LFTg5STUEX9ERbvKK4eAZu0h_3GG0WwXNKVAxTmU6Pq4jHvw55RsXQyYxnWxIaS9aCl_if0U35m0tZXlP7FpoHWy6td-fUUVgi10-u-nclWnYx';
  const { zip, cuisine } = req.query;
  const searchString = `https://api.yelp.com/v3/businesses/search?location=${zip}&term=${cuisine}&limit=5`;
  axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
  axios
    .get(searchString)
    .then(yelpRes => {
      console.log(yelpRes.data.businesses);
      res.status(200).json(yelpRes.data.businesses);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/cuisines', (req, res) => {
  const cuisines = movies.map(movie => {
    return movie.pairedCuisine;
  });
  res.json(cuisines);
});

app.get('/recipes', (req, res) => {
  //display all of the recipes
  res.json(recipes);
});

app.get('/recipes/:id', (req, res) => {
  //display the recipe for the id provided from req.params.id
  res.json(recipes[req.params.id]);
});

app.put('/recipes/:id', (req, res) => {
  //after detail submit, update document
  console.log(req.body);     //req.body = undefined if body-parser hasn't been imported
  req.body.comment = 'fake update';
  res.json(req.body);
});

app.delete('/recipes/:id', (req, res) => {
  res.send('deleted');
});

if (require.main === module) {
  app.listen(process.env.PORT || 8080, function () {
    console.info(`App listening on ${this.address().port}`);
  });
}

module.exports = app;
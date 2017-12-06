'use strict';

const mongoose = require('mongoose');
const { MovieModel, RecipeModel } = require('./models');

const movies = require('./seed-data');
const { DATABASE_URL } = require('./config');
console.log(movies);

mongoose.connect( DATABASE_URL, {useMongoClient: true} )
  .then(() => { mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    return MovieModel.insertMany(movies);
  })
  .then((res) => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });
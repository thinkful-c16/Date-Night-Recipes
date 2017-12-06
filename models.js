'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

const MovieSchema = mongoose.Schema({
  pairedCuisine: { type: String, required: true },
  title: { type: String, required: true },
  year: Number,
  runtime: { type: String, required: true },
  genre: { type: String, required: true },
  plot: { type: String, required: true },
  rating: { type: String, required: true },
  actors: { type: String, required: true }
});

const RecipeSchema = mongoose.Schema({
  zip: { type: Number, required: true },
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie' },
  restaurantId: String,
  dateNight: Date,
  rating: Number,       //1 = hot, 0 = cold  min:0 max:1
  ratingComment: String
});

const MovieModel = mongoose.model('Movie', MovieSchema);
const RecipeModel = mongoose.model('Recipe', RecipeSchema);

module.exports = { MovieModel, RecipeModel};


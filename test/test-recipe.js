'use strict';

const config = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');
const { app, runServer, closeServer } = require('../server');
const { MovieModel, RecipeModel } = require('../models');
const seedRecipes = require('../recipe-seed-data');

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

describe('apiRecipeResources', () => {

  before(function () {
    return runServer(config.TEST_DATABASE_URL, config.PORT);
  });

  beforeEach(function () {
    return RecipeModel.insertMany(seedRecipes);
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });
  
  describe('PUT endpoint', function () {
    it('should update after selecting restaurant', function () {
      const updateRecipe = {
        movieId: '5a2ab71ab124dcd3aaa4a451',
        restaurantId: 'tacos-la-villa-smyrna'
      };
      let testRecipe = '';
      let recipe;
      return RecipeModel.findOne().then(function (_recipe) {
        recipe = _recipe;
        return chai.request(app)
          .put(`/recipes/${recipe.id}`)
          .send(updateRecipe);
      })
        .then(function (res) {
          //   console.log('line 114');
          res.should.have.status(200);
          return RecipeModel.findById(recipe.id);
        })
        .then(function (recipe) {
          console.log('line 117', recipe);
          console.log(recipe.movieId, recipe.restaurantId);
          console.log(updateRecipe.movieId, updateRecipe.restaurantId);

          String(recipe.movieId).should.equal(updateRecipe.movieId);
          recipe.restaurantId.should.equal(updateRecipe.restaurantId);
        });
    });
  });
  describe('DELETE endpoint', function () {
    it('should delete a recipe by id', function () {
      let recipe;
      return RecipeModel.findOne().then(function (_recipe) {
        recipe = _recipe;
        return chai.request(app).delete(`/recipes/${recipe.id}`);
      })
        .then(function (res) {
          res.should.have.status(204);
          return RecipeModel.findById(recipe.id);
        })
        .then(function (_recipe) {
          should.not.exist(_recipe);
        });
    });
  });
});
'use strict';

const config = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');
const { app, runServer, closeServer } = require('../server');
const { MovieModel, RecipeModel } = require('../models');
// const movies = require('../seed-data');
const seedRecipes = require('../recipe-seed-data');

// chai.should();
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


  //   describe('GET endpoint', function () {
  //     it('should return all movies', function () {
  //       let res;
  //       return chai.request(app)
  //         .get('/movies')
  //         .then(function (res) {
  //           res.should.have.status(200);
  //           res.should.be.json;
  //           res.body.should.be.a('array');
  //           res.body.should.have.lengthOf(25);
  //         });
  //     });
  //     it('should return a single movie by id', function () {
  //       let res;
  //       let testId = '';
  //       return MovieModel
  //         .findOne()
  //         .then(function (movie) {
  //           testId = movie.id;
  //           return chai.request(app)
  //             .get(`/movies/${testId}`);
  //         })
  //         .then(function (res) {
  //           res.should.have.status(200);
  //           res.should.be.json;
  //           res.body.should.be.a('object');
  //           res.body.should.include.keys('_id', '__v', 'title', 'rating', 'year', 'runtime', 'genre', 'plot', 'actors', 'pairedCuisine', 'poster');
  //         });
  //     });
  //   });
  //   describe('POST endpoint', function () {
  //     it('should create new recipe', function () {
  //       const newRecipe = {
  //         firstName: 'Test',
  //         email: 'test@test.com',
  //         zip: 94117
  //       };
  //       return chai.request(app)
  //         .post('/recipes')
  //         .send(newRecipe)
  //         .then(function (res) {
  //           res.should.have.status(201);
  //           res.should.be.json;
  //           res.should.be.a('object');
  //           res.body.should.include.keys('firstName', 'email', 'zip');
  //           res.body.should.not.be.null;
  //           res.body.firstName.should.equal(newRecipe.firstName);
  //         });
  //     });
  //   });
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
        //   return RecipeModel
        //     .findOne()
        //     .then(function (recipe) {
        //       console.log('line 105',recipe);
        //       testRecipe = recipe.id;
        //       return chai.request(app)
        //   .put(`/recipes/${testRecipe}`)
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
      // return chai.request(app)
      //   .get('/recipes/:id')
      //   .then(function (res) {
      //     return chai.request(app)
      //       .delete(`/recipes/${res.body.id}`);
      //   })
      //   .then(function (res) {
      //     res.should.have.status(204);
      //   });
    });
  });
});
'use strict';

const config = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const mongoose = require('mongoose');
const { app, runServer, closeServer } = require('../server');
const { MovieModel, RecipeModel } = require('../models');
const movies = require('../seed-data');
const recipes = require('../recipe-seed-data');

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

describe('apiResources', () => {


  before(function () {
    return runServer(config.TEST_DATABASE_URL, config.PORT);
  });

  beforeEach(function () {
    return MovieModel.insertMany(movies);
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });


  describe('GET endpoint', function () {
    it('should return a single movie by id', function () {
      let res;
      return chai.request(app)
        .get('/movies')
        .then(function (res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);
        });
    });
  });
  describe('POST endpoint', function () {
    it('should create new recipe', function () {
      const newRecipe = {
        firstName: 'Test' ,
        email: 'test@test.com',
        zip: 94117
      };
      return chai.request(app)
        .post('/recipes')
        .send(newRecipe)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.should.be.a('object');
          res.body.should.include.keys('firstName', 'email', 'zip');
          res.body.should.not.be.null;
          res.body.firstName.should.equal(newRecipe.firstName);  
        });
    });
  });
  describe('PUT endpoint', function () {
    it('should update after selecting restaurant', function () {
      const updateRecipe = {
        movieId: '',
        restaurantId: ''
      };
      return chai.request(app);
    });
    it('should update after reviewing recipe', function () {
      const updateRating = {
        ratingComment: '',
        rating: ''
      };
      return chai.request(app);
    });
  });
  describe('DELETE endpoint', function () {
    it('should delete a recipe by id', function () {
      return chai.request(app)
        .get('/recipes/:id')
        .then(function(res) {
          return chai.request(app)
            .delete(`/recipes/${res.body.id}`);
        })
        .then(function(res) {
          res.should.have.status(204);
        });
    });
  });
});
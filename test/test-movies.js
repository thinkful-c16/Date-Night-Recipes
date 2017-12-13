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

chai.use(chaiHttp);

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

describe('apiMoviesResources', () => {

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
    it('should return all movies', function () {
      let res;
      return chai.request(app)
        .get('/movies')
        .then(function (res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.lengthOf(25);
        });
    });
    it('should return a single movie by id', function () {
      let res;
      let testId = '';
      return MovieModel
        .findOne()
        .then(function (movie) {
          testId = movie.id;
          return chai.request(app)
            .get(`/movies/${testId}`);
        })
        .then(function (res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys('_id', '__v', 'title', 'rating', 'year', 'runtime', 'genre', 'plot', 'actors', 'pairedCuisine', 'poster');
        });
    });
  });
  describe('POST endpoint', function () {
    it('should create new recipe', function () {
      const newRecipe = {
        firstName: 'Test',
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
});
'use strict';

const config = require('../config');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { app, runServer, closeServer } = require('../server');
const mocha = require('mocha');
const should = chai.should();
const mongoose = require('mongoose');
const { MovieModel, RecipeModel } = require('../models');
const movies = require('../seed-data');
const recipes = require('../recipe-seed-data');


chai.should();

chai.use(chaiHttp);

before(function () {
  return runServer(config.TEST_DATABASE_URL);
});

beforeEach(function () {
  return mongoose.connect(config.TEST_DATABASE_URL, { useMongoClient: true })
    .then(() => {
      return MovieModel.insertMany(movies);
    })
    .then(() => {
      return RecipeModel.insertMany(recipes);
    });
});

afterEach(function () {
  return mongoose.connection.db.dropDatabase();
});

after(function () {
  return closeServer();
});



describe('index page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/movies')
      .then(function (res) {
        res.should.have.status(200);
      });
  });
});
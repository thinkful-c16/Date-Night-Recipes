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


  describe('GET movie by Id', function () {
    it('should return a single movie', function () {
      let res;
      return chai.request(app)
        .get('/movies')
        .then(function (res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);
        });
      // it('GET , function () {

      // })
    });

  });

});
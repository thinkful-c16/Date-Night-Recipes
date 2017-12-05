'use strict';

const express = require('express');
const data = require('./seed-data');
const bodyParser = require('body-parser');


console.log(data);

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

if (require.main === module) {
  app.listen(process.env.PORT || 8080, function () {
    console.info(`App listening on ${this.address().port}`);
  });
}

app.get('/recipes', (req, res) => {
  res.json(data);
});

app.get('/recipes/:id', (req, res) => {
  res.json(data[req.params.id]);
});

app.put('/recipes/:id', (req, res) => {
  //after detail submit, update document
  console.log(req.body.comment);
  req.body.comment = 'fake update';
  res.json(req.body);
});

module.exports = app;
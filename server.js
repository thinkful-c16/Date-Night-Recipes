'use strict';

const express = require('express');
const data = require('./seed-data');

console.log(data);

const app = express();

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

module.exports = app;
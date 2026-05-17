const express = require('express');
const mongoose = require('mongoose');

const app = express();

const deliveriesRoutes = require('./routes/deliveries-routes');

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/deliveries', deliveriesRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message || 'Internal server error.';
  res.status(status).json({ message: message });
});

mongoose
  .connect(
    'mongodb+srv://sahargabay11_db_user:oTEBw2CbXQkffWqv@zariz.zj4hoih.mongodb.net/?appName=Zariz'
  )
  .then(() => {
    app.listen(5001);
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB.', err);
  });

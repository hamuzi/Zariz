const express = require('express');
const mongoose = require('mongoose');
const bosyParser = require('body-parser');

const app = express();

const authRoutes = require('./routes/auth-routes');

app.use(bosyParser.json());

// header for CORS error
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods','OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// routes
app.use('/auth', authRoutes);

// error handling
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// connect to database and start server
mongoose
  .connect(
    'mongodb+srv://sahargabay11_db_user:oTEBw2CbXQkffWqv@zariz.zj4hoih.mongodb.net/?appName=Zariz'
  )
  .then(result => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
 

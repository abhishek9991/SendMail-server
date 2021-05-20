const express = require('express');
const cors = require('cors')
require('dotenv').config();

const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//bring in routes
const authRoutes = require('./routes/auth');
const sendEmailRoute = require('./routes/sendEmail');

//routing middlewares
app.use('/auth', authRoutes);
app.use('/email', sendEmailRoute);


//spin up the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("server started"));
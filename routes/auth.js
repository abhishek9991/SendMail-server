const express = require('express');

//import handler functions
const {
  handleAuth,
  handleAuthFlowCB
} = require('../controllers/auth')


const router = express.Router();


//endpoint for triggering Google OAuth2 flow
router.get('/user', handleAuth);

//endpoint to handle the redirect (or the callback by google) 
//after the user has done authentication
//this route will trigger the exchange of recieved Code for Tokens
router.get('/google', handleAuthFlowCB);

module.exports = router;
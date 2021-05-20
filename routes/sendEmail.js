const express = require('express');

//import handler function
const {
  handleSendEmail
} = require('../controllers/sendEmail')

const router = express.Router();


//endpoint for sending email
//assuming the request body contains a mail object
//that mail object has 'to', 'subject' and 'message' of the email
router.post('/send', handleSendEmail);

module.exports = router;
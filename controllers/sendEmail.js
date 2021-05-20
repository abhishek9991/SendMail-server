const axios = require('axios');
const fs = require('fs')
//import refreshToken function 
const { renewToken } = require('../controllers/auth');





exports.handleSendEmail = async (req, res) => {
  try {
    var { access_token, useBefore } = JSON.parse(fs.readFileSync('./tokens.json'));

    //checking if acces token has expired
    //if yes, then new access token by calling refreshToken()
    if (useBefore + 5 <= Date.now()) {
      const refreshResponse = await renewToken();
      if (refreshResponse.error) {
        return res.json({ error: refreshResponse.error });
      }
      access_token = refreshResponse.access_token;
    }

    const { to, subject, message } = req.body.mail;
    const encodedMail = makeEmail(to, subject, message);
    const data = JSON.stringify({ "raw": encodedMail });

    var config = {
      method: 'post',
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      data: data
    };

    return axios(config)
      .then(function (response) {
        res.send(JSON.stringify(response.data));
      })
      .catch(function (error) {
        res.send(error);
      });
  } catch (error) {
    res.json({ error, msg: "failed to read tokens" })
  }
}


//function to build MIME msg and encode it.
function makeEmail(to, subject, message) {
  var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
    "MIME-Version: 1.0\n",
    "Content-Transfer-Encoding: 7bit\n",
    "to: ", to, "\n",
    "subject: ", subject, "\n\n",
    message
  ].join('');

  var encodedMail = Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
  return encodedMail;
}
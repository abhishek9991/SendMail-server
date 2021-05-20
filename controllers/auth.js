const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs')

//import config varibales
const {
  CLIENT_SECRET,
  CLIENT_ID,
  REDIRECT_URIS
} = require('../config');


//function to get Google Auth URL 
//this is the URL where our auth api will redirect to begin OAuth flow
const getGoogleAuthURL = () => {
  const rootURL = "https://accounts.google.com/o/oauth2/auth";
  const options = {
    redirect_uri: REDIRECT_URIS[0],
    client_id: CLIENT_ID,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.send",
    ].join(" ")
  };

  return `${rootURL}?${querystring.stringify(options)}`;
}

//function to initiate AuthFlow
exports.handleAuth = (req, res) => {
  //generate the google auth URL
  const googleAuthURL = getGoogleAuthURL();

  // redirect to the auth URL
  return res.redirect(googleAuthURL);
}

//function to handle redirect uri after user has successfully authenticated
// here the recieved code is exchanged for Tokens
exports.handleAuthFlowCB = async (req, res) => {
  try {
    //extract code from url query parameter
    const code = req.query.code;

    //calling getTokens funtion to exchange code for tokens
    //and return those tokens
    try {
      const responseData = await getTokens({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URIS[0]
      }, writeToken) //callback function for writing the tokens into file
      if (responseData.error) {
        return res.json({ error: responseData.error })
      } else {
        return res.json({ msg: "retrieved tokens successfully" });
      }
    } catch (error) {
      res.json({ error: "failed to retrieve tokens" })
    }
  } catch (error) { // if user authentication fails
    res.json({ error })
  }

}

//function used by AuthFlow Callback handler to exchange code for Tokens
const getTokens = ({ code, client_id, client_secret, redirect_uri }, writeTokenCB) => {

  const token_uri = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id,
    client_secret,
    redirect_uri,
    grant_type: "authorization_code"
  };

  //hitting google OAuth Token api endpoint to retrieve Tokens
  return axios
    .post(token_uri, querystring.stringify(values), {
      Headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then(res => {
      if (res.error) {
        return { error: res.error }
      } else {
        //caling function to write tokens to a file
        writeTokenCB(res.data);
        return res;
      }
    })
    .catch(err => {

      return { error: err };
    })
}



//function to renew Access Token if it expires, using Refresh Token
exports.renewToken = async () => {
  const token_uri = "https://oauth2.googleapis.com/token";

  //reading Refresh Token from file
  try {
    const { refresh_token } = JSON.parse(fs.readFileSync('./tokens.json'));
    try {
      const values = {
        grant_type: "refresh_token",
        refresh_token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      }
      const response = await axios
        .post(token_uri, querystring.stringify(values), {
          Headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          }
        });
      //if reponse contains error, return that error
      if (response.error)
        return { error: response.error };
      else
        return writeToken({ ...response.data, refresh_token });

    } catch (error) {
      return { error: "failed to renew access token" }
    }

  } catch (error) {
    return { error: "failed to read refresh access token" }
  }
}


//function to write tokens in a file
const writeToken = ({ access_token, refresh_token, id_token, expires_in }) => {
  var useBefore = Date.now() + expires_in * 1000;
  try {
    fs.writeFileSync('./tokens.json', JSON.stringify({ access_token, refresh_token, id_token, useBefore }));
    return ({ access_token });
  } catch (error) {
    return { error }
  }
};
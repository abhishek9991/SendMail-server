# **SendEmail-server**

## **API Docs** :

### **1) To initiate the OAuth 2.0 process. and store user credentials in a file:**
```
  endpoint : /auth/user
  method   : GET
  
  request body : empty
  response data: either an json containing error
                 or the following json for successsful token retrieval
                 
                 {
                   "msg":"retrieved tokens successfully"
                 }
  ``` 

### **2) To execute send email using the credentials previously stored from OAuth 2.0 process:**

```
  endpoint : /email/send
  method   : POST
  
  request body -
                { 
                    "mail" : {
                      "to" : "<recipient's email address>",
                      "subject" : "<subject of the email",
                      "message" : "<body of the email>"
                    }
                }
  
  response data : either an json containing error
                  or the following json for successfull email sending
                  
                  {
                    "id":"<id of message>",
                    "threadId":"<thread id>",
                    "labelIds":["SENT"]
                  }
```

# front-end

## To run client/ and server/ servers: ##
### DEV: ###
1. Adjust `ENVIRONMENT` variable in .env under client/ and server/
2. Run `REACT_APP_PORT=3000 nodemon start` from /client
3. Run `nodemon app.js` from /server
4. At https://dev-107896-admin.okta.com/admin/app/oidc_client/instance/0oa7wfk9fAL5mqQZp5d5/#tab-general
    1. `Login redirect URIs` -> http://localhost:3000/implicit/callback
    2. `Logout redirect URIs` -> http://localhost:3000/
    3. `Initiate login URI` -> http://localhost:3000/ 

###  PROD: ###
1. Adjust `ENVIRONMENT` variable in .env under client/ and server/
2. Run `REACT_APP_PORT=80 nodemon start` from /client
3. Run `nodemon app.js` from /server
4. At https://dev-107896-admin.okta.com/admin/app/oidc_client/instance/0oa7wfk9fAL5mqQZp5d5/#tab-general
    1. `Login redirect URIs` -> https://aquaeye.ai/implicit/callback
    2. `Logout redirect URIs` -> https://aquaeye.ai/
    3. `Initiate login URI` -> https://aquaeye.ai/ 

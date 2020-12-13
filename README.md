# front-end

To run client/ and server/ servers:
  DEV:
   1. Adjust `ENVIRONMENT` variable in .env under client/ and server/
   2. Run `REACT_APP_PORT=3000 nodemon start` from /client
   3. Run `node app.js` from /server

  PROD:
   1. Adjust `ENVIRONMENT` variable in .env under client/ and server/
   2. Run `REACT_APP_PORT=80 nodemon start` from /client
   3. Run `node app.js` from /server

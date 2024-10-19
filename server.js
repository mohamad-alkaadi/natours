// a good practace to make everything related to express in a file and everything related to the server in another
// everything that is not related to express we do it outside of app.js
// we also use database configurations, error handling, or environment variables
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app running ono port ${port}`);
});

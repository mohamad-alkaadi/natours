// a good practace to make everything related to express in a file and everything related to the server in another
// we also use database configurations, error handling, or environment variables
const app = require('./app');

const port = 3000;
app.listen(port, () => {
  console.log(`app running ono port ${port}`);
});

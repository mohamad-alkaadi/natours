const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB connection successful');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app running ono port ${port}`);
});

// this is called a safety net
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 shutting down...');
  console.log(err.name, err.message);
  //to exit our application // we pass it a code // 0 is passed for success // 1 is passed for uncaught exception
  // on server.close we give the server time to finish all the request that are still pending or being handled at the time and after that the server is killed
  server.close(() => {
    process.exit(1);
  });
});

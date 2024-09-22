const express = require('express');
const app = express();

app.get('/', (req, res) => {
  //   res.send('Hello from server!');
  //   to specify the status
  //   by using .json it will automatically set our content-type to application/json
  res.status(200).json({ message: 'Hello from server!', app: 'Natours' });
});

app.post('/', (req, res) => {
  res.send('you can post to here');
});

const port = 3000;
app.listen(port, () => {
  console.log(`app running ono port ${port}`);
});

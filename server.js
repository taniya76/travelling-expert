const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const async = require('express-async-errors')
const fetch = require('node-fetch')

/* Server Setup */
const app = express();
app.use(cors());

app.use(express.static(__dirname+'public'));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());


const Port = 8080;
app.listen(process.env.PORT || Port, () => {
  console.log(`CORS-enabled web server listening on port ${Port}`);
});

/* Routes */

app.get('/', (req, res) => {
  res.status(200).sendFile(__dirname+ "/index.html");
});

app.post('/save', (req, res, next) => {
  if (req.body !== " ") {
    const trip = req.body.trip;
    res.status(201).send(trip);
  } else {
    res.status(400).json('Bad Request');
  }
});



app.post('/forecast', async (req, res, next) => {
  if (req.body.endpoint !== " ") {
    const endpoint = req.body.endpoint;
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const jsonRes = await response.json();
        res.status(201).send(jsonRes);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(400).json('Bad Request');
  }
});

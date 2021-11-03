const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const app = express();
const port = 3000;
const fs = require("fs");

// setup the ability to see into response bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// setup the express assets path
app.use("/", express.static(path.join(__dirname, "../client")));

// API calls ------------------------------------------------------------------------------------
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "../client/pages/home.html"));
});

app.get("/race", async (req, res) => {
  res.sendFile(path.join(__dirname, "../client/pages/race.html"));
});

/**
 * API to get the date from the data.json file
 *
 */
app.get("/api/data", (req, res) => {
   // TODO: use relative path here
  fs.readFile("./data.json", (err, data) => {
    if (err) {
      res.status(404).message("File not found.");
    }
    res.send(data)
  });
});

/**
 * API to call for the tracks - this calls the API /api/data to get the json data.
 */
app.get("/api/tracks", async (req, res) => {
  try {
    let result = await fetch("http://localhost:3000/api/data"); 
    let data = await result.json();// TODO: Need to filter out the tracks from the result
    res.send(data);
  } catch (e) {
    res.status(400).send('Bad Request')
  }
});

/**
 * API to get the cars from the data file.
 */
app.get("/api/cars", async (req, res) => {
  try {
    let result = await fetch("http://localhost:3000/api/data");  
    let data = await result.json(); // TODO: Need to filter out the tracks from the result
    res.json(data);
  } catch (e) {
    res.status(400).send('Bad Request')
  }
});

app.get("/api/races/:id", (req, res) => {
  const { id } = req.params;
  res.json({ id }); // temp hard coded just echo back the id
});

app.post("/api/races/:id/accelerate", (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  res.send(`Accelerated ${id}`); // hard coded to one for now.
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

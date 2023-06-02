// Packages
const express = require("express");
const xmlparser = require("xml-js");
const getQueryParam = require("get-query-param");
const axios = require("axios").default;
const rateLimit = require("express-rate-limit");
const colors = require("colors");

// Configuration
const RATE_LIMIT_WINDOW_TIME = 1 * 60 * 1000; // 1 minute
const RATE_LIMIT_REQUEST_MAX = 150; // 65 requests

// Functions
function logInformation(tag, data) {
  console.log(colors.yellow(`[${tag}]: `) + colors.underline(data));
}

// express app
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_TIME,
  max: RATE_LIMIT_REQUEST_MAX,
  message: "0"
});

const app = express();
logInformation("Startup", "Created express server instance.");

app.use(limiter);
logInformation("Startup", "Started using app rate limiter");

// api
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/:id", (req, res) => {
  let imageId = req.params.id;

  if (imageId) {
    // http://www.roblox.com/asset/?id=4562735369
    axios
      .get(`https://assetdelivery.roblox.com/v1/asset/?id=${imageId}`)
      .then(function(response) {
        if (response.data) {
          var xml = xmlparser.xml2json(response.data, {
            compact: true,
            spaces: 4
          });
          const parsedXML = JSON.parse(xml);
          const resultURL = parsedXML.roblox.Item.Properties.Content.url._text;
          const result = resultURL.split("=")[1];
          res.send(result);
        } else {
          res.status(500).send("0");
        }
      })
      .catch(function(error) {
        console.log(error);
        res.status(500).send("0");
      });
  } else {
    res.status(500).json("0");
  }
});

// Listen
app.listen(process.env.PORT, () => {
  console.log(
    colors.green("Running: ") + `http://localhost:${process.env.PORT}`
  );
});

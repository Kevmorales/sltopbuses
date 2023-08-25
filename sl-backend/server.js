const express = require("express");
const axios = require("axios");
require("dotenv").config();

//  Express server.
const app = express();

// porten
const PORT = process.env.PORT || 3002;

//  CORS så att frontend kan prata med backend över url
const cors = require("cors");
app.use(
  cors({
    origin: "https://sbab-sl-buses.surge.sh",
  })
);

// hämta topp 10 busslinjer.
app.get("/top-bus-lines", async (req, res) => {
  const API_STOPSTWO = process.env.API_STOPSTWO; // apiet från env filen
  let stopsUrl = `https://api.sl.se/api2/LineData.json?model=JourneyPatternPointOnLine&key=${API_STOPSTWO}&DefaultTransportModeCode=bus`;

  try {
    const stopsResponse = await axios.get(stopsUrl);

    // vill kolla så att det är en array, annars fuckas allt.....
    if (
      !stopsResponse.data.ResponseData ||
      !Array.isArray(stopsResponse.data.ResponseData.Result)
    ) {
      return res
        .status(500)
        .send("Unexpected data format received from stops API");
    }

    let allStops = stopsResponse.data.ResponseData.Result;

    // Räkna kombinationen av LineNumber och DirectionCode. för att få fram antal stopp
    let lineCounts = allStops.reduce((acc, stop) => {
      const key = `${stop.LineNumber}-${stop.DirectionCode}`;
      const lineKey = stop.LineNumber;
      acc[key] = (acc[key] || 0) + 1;

      // Vill inte att DirectionCode 1 & 2 ska räknas två gånger
      if (!acc[lineKey] || acc[key] > acc[lineKey]) {
        acc[lineKey] = acc[key];
      }
      return acc;
    }, {});

    //  ta de första 10.
    let sortedLines = Object.keys(lineCounts)
      .filter((key) => !key.includes("-")) // Only pick keys that are pure LineNumbers (no DirectionCode)
      .map((lineNumber) => [lineNumber, lineCounts[lineNumber]])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    res.json(sortedLines);
  } catch (error) {
    console.error("Error fetching top bus lines:", error);
    res.status(500).send("Error fetching top bus lines");
  }
});

app.get("/bus-line-stops/:lineNumber/:direction", async (req, res) => {
  const API_STOPSTWO = process.env.API_STOPSTWO;
  const lineNumber = req.params.lineNumber;
  const direction = req.params.direction;

  let stopsUrl = `https://api.sl.se/api2/LineData.json?model=JourneyPatternPointOnLine&key=${API_STOPSTWO}&DefaultTransportModeCode=bus`;
  let stopNamesUrl = `https://api.sl.se/api2/LineData.json?model=stop&key=${API_STOPSTWO}&DefaultTransportModeCode=bus`;

  try {
    const stopsResponse = await axios.get(stopsUrl);
    const stopNamesResponse = await axios.get(stopNamesUrl);

    if (
      !Array.isArray(stopsResponse.data.ResponseData.Result) ||
      !Array.isArray(stopNamesResponse.data.ResponseData.Result)
    ) {
      return res.status(500).send("Unexpected data format received from API");
    }

    let relevantStops = stopsResponse.data.ResponseData.Result.filter(
      (stop) =>
        stop.LineNumber === lineNumber && stop.DirectionCode === direction
    );

    let stopsWithNames = relevantStops.map((stop) => {
      let foundStop = stopNamesResponse.data.ResponseData.Result.find(
        (nameStop) =>
          nameStop.StopPointNumber === stop.JourneyPatternPointNumber
      );
      return foundStop ? foundStop.StopPointName : null;
    });

    res.json(stopsWithNames);
  } catch (error) {
    console.error("Error fetching bus line stops:", error);
    res.status(500).send("Error fetching bus line stops");
  }
});

// Starta servern på angiven port.
app.listen(PORT, () => {
  console.log(`Servern körs på port ${PORT}`);
});

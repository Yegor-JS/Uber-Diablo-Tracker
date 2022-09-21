const express = require("express");
const app = express();
const axios = require("axios");

app.use(express.static("./public"));

const fetchData = async () => {
  const response = await axios.get("https://diablo2.io/dclone_api.php?", {
    params: {
      sk: "r",
    },
  });
  allRegions = response.data;
  // Faking response for testing purposes:
  // allRegions[0].reporter_id = 333
  // allRegions[0].progress = 5
  // allRegions[8].progress = 9
  return allRegions;
};

let currentData = null;
async function collectDataOnceInAMinute() {
  currentData = await fetchData();
  setTimeout(() => {
    collectDataOnceInAMinute();
  }, 30000);
}
collectDataOnceInAMinute();


app.get("/api/data", async (req, res) => {
  const data = currentData;
  res.send(data);
});

app.listen(80, () => {
});
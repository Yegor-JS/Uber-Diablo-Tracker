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
  return allRegions;
};

let currentData = null;
async function collectDataOnceInAMinute() {
  currentData = await fetchData();
  setTimeout(() => {
    collectDataOnceInAMinute();
  }, 60000);
}
collectDataOnceInAMinute();


app.get("/api/data", async (req, res) => {
  const data = currentData;
  res.send(data);
});


app.listen(3000, () => {
});
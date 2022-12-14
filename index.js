const express = require("express");
const app = express();
const axios = require("axios");
const fs = require('fs');

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
  // allRegions[10].progress = 9
  return allRegions;
};

let currentData = null;
async function collectDataOnceInAMinute() {
  let dataForLogging;

  try {
    dataForLogging = await fetchData();
    currentData = dataForLogging;
  } catch (error) {
    dataForLogging = error;
  }
  createLogs(dataForLogging);
  setTimeout(() => {
    collectDataOnceInAMinute();
  }, 30000);
}
collectDataOnceInAMinute();

app.get("/api/data", async (req, res) => {
  res.send(currentData);
});

// Creating logs
const createLogs = (dataForLogging) => {

  const serverLogs = 'server_logs.log'
  const pathToLogs = `./${serverLogs}`;

  const isNewLine = () => {
    if (!fs.existsSync(pathToLogs)) {
      return Date() + ' ';
    } else {
      return `\n${Date()} `;
    }
  };

  lineToInsert = isNewLine() + JSON.stringify(dataForLogging);

  const newLine = () => fs.appendFile(pathToLogs, lineToInsert, (err) => {
    if (err) throw new Error('Something went wrong with the logging');
  });
  newLine();

  // Deleting logs if the file is too big
  if (fs.existsSync(pathToLogs)) {
    const stats = fs.statSync(pathToLogs)
    const fileSizeInBytes = stats.size;
    const fileSizeIngiGigabytes = fileSizeInBytes / (1024 * 1024 * 1024);
    if (fileSizeIngiGigabytes > 1) {
      fs.unlink(pathToLogs, (err) => {
        if (err) throw new Error;
      });
    }
  };
};
// Done with creating logs

app.listen(80, () => {
});
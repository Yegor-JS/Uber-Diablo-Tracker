const UPDATE_TIMEOUT = 60 * 1000;

const regions = document.getElementById('regions');
const modes = document.getElementById('modes');
const hardcorness = document.getElementById('hardcorness');

const possibleRegions = ["America", "Europe", "Asia"];

let nonLadderSoftcore = [];
let nonLadderHardcore = [];
let ladderSoftcore = [];
let ladderHardcore = [];

const getResults = async () => {
  const response = await fetch("/api/data");
  const data = await response.json();
  return data;
}

const updateTable = async () => {
  const allRegions = await getResults();
  
  allRegions.forEach((element) => {
    if (element.ladder === "2" && element.hc === "2") {
      nonLadderSoftcore.push(element);
    } else if (element.ladder === "2" && element.hc === "1") {
      nonLadderHardcore.push(element);
    } else if (element.ladder === "1" && element.hc === "2") {
      ladderSoftcore.push(element);
    } else if (element.ladder === "1" && element.hc === "1") {
      ladderHardcore.push(element);
    } else {
      throw new Error("dunnolol");
    }
  });

  const createTable = (regionData, modeAndRegion) => {

  const table = document.createElement("table");
  const row = document.createElement("tr");
  table.appendChild(row);

  for (let j = 0; j < possibleRegions.length; j++) {
    const cell = document.createElement("td");
    cell.innerText = `${possibleRegions[j]}: ${regionData[j].progress}/6,`;
    if (j === (possibleRegions.length - 1)) {
      cell.innerText = cell.innerText.replace(',', '.');
      }
    row.appendChild(cell);
    }

  const tableRoot = document.getElementById(modeAndRegion);
  tableRoot.appendChild(table);
  }

  createTable(nonLadderSoftcore, "nlsc");
  createTable(nonLadderHardcore, "nlhc");
  createTable(ladderSoftcore, "lsc");
  createTable(ladderHardcore, "lhc");
  
};

updateTable();

const  showResult = async () => {

  event.preventDefault();

  const data = await getResults();

  const whatUserWanted = data.find(({region, ladder, hc}) =>
  region === regions.value &&
  ladder === modes.value &&
  hc === hardcorness.value
  );

  const formOptions = ["regions", "modes", "hardcorness"];
  const finalOptions = [];

  for (let j = 0; j < formOptions.length; j++) {
    const select = document.getElementById(formOptions[j]);
    const selectedText = select.options[select.selectedIndex].text;
    finalOptions.push(selectedText);
  };

  const whatUserWantedFormated = `${finalOptions.join(", ")}: ${whatUserWanted.progress}/6`

  if (!document.getElementById('form').querySelector('table')) {

  const table = document.createElement("table");
  const row = document.createElement("tr");
  table.appendChild(row);

  const cell = document.createElement("td");
  cell.innerText = whatUserWantedFormated;
  row.appendChild(cell);

  const tableRoot = document.getElementById('form');
  tableRoot.appendChild(table);
  } else {
    document.getElementById('form').querySelector('td').innerText = whatUserWantedFormated;
  }
  };


form.addEventListener('submit', showResult);

// NOTIFICATIONS PART BEGINS!

let oldData = [];
let newData = [];

const notifiyAboutChanges = async () => {

  const data = await getResults();

  if (!oldData[0]) {
    let j = 0;
    data.forEach((element) => {
      oldData.push(element);
      j++;
    });
  } else {
      let j = 0;
      data.forEach((element) => {
        newData.push(element);
        j++;
      });

      const changedData = newData.filter((element, index) => 
        element.progress !== oldData[index].progress
      );

      if (changedData.length > 0) {

          const isLadder = ['Ladder', 'Non Ladder']
          const isHardcore = ['Hardcore', 'Softcore']

          let changedDataToDisplay = '';
          
          changedData.forEach((element) => {
            changedDataToDisplay =
            changedDataToDisplay +
            isLadder[element.ladder - 1] + ', ' +
            isHardcore[element.hc - 1] + ', ' +
            possibleRegions[element.region - 1] + ': ' +
            element.progress + '/6; ';
          });

          changedDataToDisplay = changedDataToDisplay.substring(0, changedDataToDisplay.length-2) + ".";
          
          let isPlural;

          if (changedData.length === 1) {
            isPlural = "There's a change:";
          } else {
            isPlural = "There are changes:";
          };

          let notification = new Notification(`${isPlural} ${changedDataToDisplay}`);
          console.log(isPlural, changedDataToDisplay);

          oldData = JSON.parse(JSON.stringify(newData));
          newData = [];
        } else {
            newData = [];
      }
    }

  setTimeout(() => {
    notifiyAboutChanges();
  }, UPDATE_TIMEOUT);
};

const requestNotificationPermission = () => {
  let notificationTurnedOn = false;

  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    notificationTurnedOn = true;
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        notificationTurnedOn = true;
      }
    });
  }

  if (notificationTurnedOn) {
    notifiyAboutChanges();
  }
};

requestNotificationPermission();
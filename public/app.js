const UPDATE_TIMEOUT = 30 * 1000;

const regions = document.getElementById('regions');
const modes = document.getElementById('modes');
const hardcorness = document.getElementById('hardcorness');

const possibleRegions = ["America", "Europe", "Asia"];

const getResults = async () => {
  const response = await fetch("/api/data");
  const data = await response.json();
  return data;
}

const createTable = (id) => {

  const table = document.createElement("table");
  const row = document.createElement("tr");
  table.appendChild(row);

  for (j = 0; j < possibleRegions.length; j++) {
    const cell = document.createElement("td");
    row.appendChild(cell);
  }

  const tableRoot = document.getElementById(id);
  tableRoot.appendChild(table);
};

ids = ['nlsc', 'nlhc', 'lsc', 'lhc']

ids.forEach(createTable);

let nonLadderSoftcore = [];
let nonLadderHardcore = [];
let ladderSoftcore = [];
let ladderHardcore = [];

const updateCellsInnerText = async (regionData, id) => {

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

  const tableRoot = document.getElementById(id);
  const cells = tableRoot.querySelectorAll("td");

  let j = 0;

  for (let element of cells) {
    let currentProgress;
    if (regionData[j].progress > 1) {
      currentProgress = `<b>${regionData[j].progress}</b>`
    } else {
      currentProgress = regionData[j].progress;
    }
    element.innerHTML = `${possibleRegions[j]}: ${currentProgress}/6,`;
    if (j === (possibleRegions.length - 1)) {
      element.innerText = element.innerText.replace(',', '.');
    }
    j++;
  }

  nonLadderSoftcore = [];
  nonLadderHardcore = [];
  ladderSoftcore = [];
  ladderHardcore = [];

};

const refreshTable = () => {

  const possibleModes = [
    nonLadderSoftcore,
    nonLadderHardcore,
    ladderSoftcore,
    ladderHardcore
  ]

  possibleModes.forEach((element, i) => {
    updateCellsInnerText(element, ids[i]);
  });

  // A straightforward, but less fancy way of doing it:
  // updateCellsInnerText(nonLadderSoftcore, "nlsc");
  // updateCellsInnerText(nonLadderHardcore, "nlhc");
  // updateCellsInnerText(ladderSoftcore, "lsc");
  // updateCellsInnerText(ladderHardcore, "lhc");

  setTimeout(() => {
    refreshTable();
  }, UPDATE_TIMEOUT);
};

refreshTable();

const showResult = async () => {

  event.preventDefault();

  const data = await getResults();

  const whatUserWanted = data.find(({ region, ladder, hc }) =>
    region === regions.value &&
    ladder === modes.value &&
    hc === hardcorness.value
  );

  const formOptions = ["regions", "modes", "hardcorness"];
  const finalOptions = [];

  for (j = 0; j < formOptions.length; j++) {
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
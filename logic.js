//const { dialog } = require('electron').remote;
//const { BrowserWindow } = require('electron').remote;

var currentMode = 'input';  // default mode is to input data
var currentMonth;
var currentYear;

var rawData = [];

var categoryList = [ 'Eating Out', 'Food', 'Hobbies', 'Car Payment', 'Storage', 'Rent', 'Car Insurance', 'Gas', 'Credit Card',
  'Gifts', 'Activities', 'Online Subscriptions', 'Pets', 'Vices', 'Savings', 'Clothing', 'Income', 'Household Goods', 'Other'];

var alertCategory = [ 'eatingout', 'onlinesubscriptions' ]; // This alert list should be configurable, but will provide its own
  // sections on the breakdown.

var loadContent = `
  <div class="d-flex justify-content-center">
    <div class="spinner-border" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Loading...</span>
      </div>
  </div>
  `;

const GoogleChartsNode = require('google-charts-node');
var fs = require('fs');

window.addEventListener('load', (event) => {
  console.log('page is fully loaded');

  var d = new Date();
  currentMonth = d.getMonth();
  currentYear = d.getFullYear();

  buildPage();
});


const reviewBtn = document.getElementById('reviewBtn');
const inputBtn = document.getElementById('inputBtn');
const homeBtn = document.getElementById('homeBtn');
const saveBtn = document.getElementById('saveBtn');
const importBtn = document.getElementById('importBtn');

reviewBtn.addEventListener('click', function() {
  console.log('review button event');
  currentMode = 'review';
  buildPage();
});

inputBtn.addEventListener('click', function() {
  console.log('input button event');
  currentMode = 'input';
  buildPage();
});

homeBtn.addEventListener('click', function() {
  console.log('home button event');
  currentMode = 'home';
  buildPage();
});

saveBtn.addEventListener('click', function() {
  console.log('save button event');
  saveData();
});

importBtn.addEventListener('click', function() {
  console.log('import button event');
  importChase();
});

async function buildPage() {

  document.getElementById('main-page').innerHTML = '';

  if (currentMode == 'input') {
    var injectDataListCategory = '';

    categoryList.forEach(data => {
      injectDataListCategory += `<option value="${data}">`;
    });

    var injectHtml = `
      <h2>Enter Data:</h2>
      <form>
        <label for="price">Price:</label>
        <input type="number" id="price"></br></br>

        <label for="category">Category:</label>
        <input type="text" id="category" list="categoryList"></br></br>

        <label for="day">Day:</label>
        <input type="date" id="day"></br></br>

        <label for="time">Time: (Optional)</label>
        <input type="time" id="time"></br></br>

        <label for="event">Event: (optional)</label>
        <input type="text" id="event"></br></br>

        <label for="location">Location: (Optional)</label>
        <input type="text" id="location"></br></br>

      </form>
      <button type="button" id="inputSubmit">Submit</button>
      <datalist id="categoryList">
        ${injectDataListCategory}
      </datalist>
    `;

    document.getElementById('main-page').innerHTML += injectHtml;

    const inputSubmit = document.getElementById('inputSubmit');
    inputSubmit.addEventListener('click', function() {
      console.log('submit event');

      // time to save the data from the field, checking for optional options
      let price = document.getElementById('price').value;
      let category = document.getElementById('category').value;
      let day = document.getElementById('day').value ? document.getElementById('day').value : '';
      let time = document.getElementById('time').value ? document.getElementById('time').value : '';
      let eventData = document.getElementById('event').value ? document.getElementById('event').value : '';
      let location = document.getElementById('location').value ? document.getElementById('location').value : '';

      if (price == '' || category == '') {
        var errorInject = [
          '<div class="submitError">ERROR: Required Data Missing!</div>'
        ].join("\n");

        document.getElementById('main-page').innerHTML += errorInject;
      } else {

        var tempJSON = {
          price: price,
          category: category.toLowerCase().trim().replace(/\s/g, ""),
          day: day,
          time: time,
          optionals: {
            event: eventData,
            location: location
          }
        }

        rawData.unshift(tempJSON);
        console.log('Added New Data...');
        console.log(rawData);

        // Now to empty the values
        document.getElementById('price').value = '';
        document.getElementById('category').value = '';
        document.getElementById('day').value = '';
        document.getElementById('time').value = '';
        document.getElementById('event').value = '';
        document.getElementById('location').value = '';
      }
    });

  } else if (currentMode == 'review') {
    document.getElementById('main-page').innerHTML = loadContent;

    try {
      moneyCat().then(content => {
        document.getElementById('main-page').innerHTML = content;
      });
    } catch(err) {
      console.log(err);
    }

  } else if (currentMode == 'home') {

  } else {
    console.log('Unsupported Mode Selected...');
    console.log(`Mode: ${currentMode}`);
  }
}

function friendlyMonth(month) {
  var friendly = new Array();
  friendly[0] = "January";
  friendly[1] = "February";
  friendly[2] = "March";
  friendly[3] = "April";
  friendly[4] = "May";
  friendly[5] = "June";
  friendly[6] = "July";
  friendly[7] = "August";
  friendly[8] = "September";
  friendly[9] = "October";
  friendly[10] = "November";
  friendly[11] = "December";

  return friendly[month];
}

function saveData() {
  let tmpMonth = friendlyMonth(currentMonth);
  fs.writeFileSync(`./data/${tmpMonth}-${currentYear}.json`, JSON.stringify(rawData, null, 2));
}

async function moneyCat() {

  var itemsProcessed = 0;
  var processingDone = false;

  var calItems = {
    eatingout: {
      proper: 'Eating Out',
      total: 0,
      times: 0,
      individualData: []
    },
    food: {
      proper: 'Food',
      total: 0,
      times: 0,
      individualData: []
    },
    hobbies: {
      proper: 'Hobbies',
      total: 0,
      times: 0,
      individualData: []
    },
    carpayment: {
      proper: 'Car Payment',
      total: 0,
      times: 0,
      individualData: []
    },
    storage: {
      proper: 'Storage Unit',
      total: 0,
      times: 0,
      individualData: []
    },
    rent: {
      proper: 'Rent',
      total: 0,
      times: 0,
      individualData: []
    },
    carinsurance: {
      proper: 'Car Insurance',
      total: 0,
      times: 0,
      individualData: []
    },
    gas: {
      proper: 'Gas',
      total: 0,
      times: 0,
      individualData: []
    },
    creditcard: {
      proper: 'Credit Card',
      total: 0,
      times: 0,
      individualData: []
    },
    gifts: {
      proper: 'Gifts/Presents',
      total: 0,
      times: 0,
      individualData: []
    },
    activities: {
      proper: 'Activities',
      total: 0,
      times: 0,
      individualData: []
    },
    onlinesubscriptions: {
      proper: 'Online Subscriptions',
      total: 0,
      times: 0,
      services: [],
      individualData: []
    },
    pets: {
      proper: 'Pets',
      total: 0,
      times: 0,
      individualData: []
    },
    vices: {
      proper: 'Vices',
      total: 0,
      times: 0,
      individualData: []
    },
    other: {
      proper: 'Other',
      total: 0,
      times: 0,
      individualData: []
    },
    householdgoods: {
      proper: 'Household Goods',
      total: 0,
      times: 0,
      individualData: []
    },
    savings: {
      proper: 'Savings Account',
      total: 0,
      times: 0,
      individualData: []
    },
    clothing: {
      proper: 'Clothing',
      total: 0,
      times: 0,
      individualData: []
    },
    global: {
      totalSpent: 0,
      extraOverview: '',
      mostExpensive: {
        item: '',
        cost: 0
      }
    },
    income: {
      proper: 'Income',
      total: 0,
      times: 0,
      individualData: []
    },
    alerts: {
      onlinesubMessage: '',
      eatingoutMessage: ''
    }
  };


  rawData.forEach((data, index) => {
    console.log('For Each in review...');

    // First add to the total and times of each subject
    categoryList.forEach(listData => {
      let workingCategory = listData.toLowerCase().trim().replace(/\s/g, "");
      //console.log(`workingCategory: ${workingCategory} || data.category: ${data.category} || Equal: ${ data.category == workingCategory}`);
      if (data.category == workingCategory ) {
        //console.log(`SUCCESS:: workingCategory: ${workingCategory} || data.category: ${data.category}`);
        calItems[workingCategory].total = calItems[workingCategory].total + parseFloat(data.price);
        calItems[workingCategory].times++;
        itemsProcessed++;

        // Then add the data to the individual data fields
        calItems[workingCategory].individualData.push(data);
      }
    });

    // After the the basics we can dive deaper into logical items.
    if (data.category == 'onlinesubscriptions') {
      if (data.optionals.event.length >= 1) {
        let tempArray = [ data.optionals.event, data.price ];
        calItems.onlinesubscriptions.services.push(tempArray);
        // This will add the service and price of the service to an array
        // Creating a two dimensional array of the data.
      }
    } else if (data.category == 'hobbies') {

    }

    if (data.category != 'income') {
      // to prevent the income from counting towards a total spent
      calItems.global.totalSpent = calItems.global.totalSpent + parseFloat(data.price);

      if (calItems[data.category].total > calItems.global.mostExpensive.cost) {
        calItems.global.mostExpensive.cost = calItems[data.category].total;
        calItems.global.mostExpensive.item = calItems[data.category].proper;
      }
    }

    alertCategory.forEach(alertData => {
      if (data.category == alertData) {
        if (alertData == 'eatingout') {
          console.log('eating out alert');
          calItems.alerts.eatingoutMessage = `You ate out a total of ${calItems.eatingout.times} ${calItems.eatingout.times > 1 ? 'times' : 'time'} costing $${calItems.eatingout.total} in total.`;
        } else if (alertData == 'onlinesubscriptions') {
          calItems.alerts.onlinesubMessage = ``;
        }
      }
    });

    if ( rawData.length -1 == index) {

      if (calItems.global.totalSpent < calItems.income.total) {
        // has leftovers
        var leftover = calItems.income.total - calItems.global.totalSpent;
        calItems.global.extraOverview = `You ended the month with $${leftover.toFixed(2)} left!`;
      } else {
        // no leftovers
        var leftover = calItems.global.totalSpent - calItems.income.total;
        calItems.global.extraOverview = `Unfortunatly you spent $${leftover.toFixed(2)} more than you earned.`;
      }

      console.log('Finished Processing Items...');
      processingDone = true;
    }
  });

  if (processingDone) {
    console.log(calItems);
    // Build the charts rows quickly
    var chartTitle = 'Total Spending';
    const drawChartStr = `
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Category');
      data.addColumn('number', 'Total Cost');
      data.addRows([
        ['${calItems.food.proper}', ${calItems.food.total}],
        ['${calItems.eatingout.proper}', ${calItems.eatingout.total}],
        ['${calItems.hobbies.proper}', ${calItems.hobbies.total}],
        ['${calItems.carpayment.proper}', ${calItems.carpayment.total}],
        ['${calItems.storage.proper}', ${calItems.storage.total}],
        ['${calItems.rent.proper}', ${calItems.rent.total}],
        ['${calItems.carinsurance.proper}', ${calItems.carinsurance.total}],
        ['${calItems.gas.proper}', ${calItems.gas.total}],
        ['${calItems.creditcard.proper}', ${calItems.creditcard.total}],
        ['${calItems.gifts.proper}', ${calItems.gifts.total}],
        ['${calItems.activities.proper}', ${calItems.activities.total}],
        ['${calItems.onlinesubscriptions.proper}', ${calItems.onlinesubscriptions.total}],
        ['${calItems.pets.proper}', ${calItems.pets.total}],
        ['${calItems.vices.proper}', ${calItems.vices.total}],
        ['${calItems.savings.proper}', ${calItems.savings.total}],
        ['${calItems.clothing.proper}', ${calItems.clothing.total}],
        ['${calItems.householdgoods.proper}', ${calItems.householdgoods.total}],
      ]);

      var options = {
        title: '${chartTitle}',
      };
      var chart = new google.visualization.PieChart(document.getElementById('totalPiechart'));
      chart.draw(data, options);
      `;

    try {
      const image = await GoogleChartsNode.render(drawChartStr, {
        width: 400,
        height: 300,
      });

      // Because of floating point precision problems, I can round up some values to the nearest two decimals, like total spent, or earned
      var injectHtml = `
        <div class="container">
          <div class="row">
            <div class="col">
              <div id='totalPiechart'>
                <img src="data:image/png;base64, ${image.toString('base64')}" />
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div id="universalBreak">
                <div class="card" style="width: 18rem;">
                  <div class="card-body">
                    <h5 class="card-title">Overview</h5>
                    <p class="card-text">
                      You spent a total of $${calItems.global.totalSpent.toFixed(2)} this month.</br></br>
                      You earned $${calItems.income.total.toFixed(2)} with ${calItems.income.times} ${calItems.income.times > 1 ? 'paydays' : 'payday'}!</br></br>
                      ${calItems.global.extraOverview}</br>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col">
              <div id="costBreakdown">
                <div class="card" style="width: 18rem;">
                  <div class="card-body">
                    <h5 class="card-title">Notible Costs</h5>
                    <p class="card-text">
                      The largest part of your budget was taken by ${calItems.global.mostExpensive.item} at $${calItems.global.mostExpensive.cost}.</br></br>
                      ${ calItems.savings.total > 1 ? `You managed to save $${calItems.savings.total} this month!</br></br>` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col">
              <div id="alert">
                <div class="card" style="width: 18rem;">
                  <div class="card-body">
                    <h5 class="card-text">Alerts</h5>
                    <p class="card-text">
                      ${ calItems.alerts.eatingoutMessage ? calItems.alerts.eatingoutMessage : ''}
                      ${ (function onlineSubCreate() {
                        console.log('onlinesubscreate');
                          if (calItems.onlinesubscriptions.services.length > 0) {
                            console.log('onlinesubcreate if statement');
                            var tmpOnlineString = `<ul>`;
                            calItems.onlinesubscriptions.services.forEach((data, index) => {
                              console.log('onlinesubcreate; if statement; foreach');
                              console.log(calItems.onlinesubscriptions.services);
                              tmpOnlineString+= `<li>${calItems.onlinesubscriptions.services[index][0]} cost $${calItems.onlinesubscriptions.services[index][1]} this month.</li>`;
                              //return `${calItems.onlinesubscriptions.services[0]} cost $${calItems.onlinesubscriptions.services[1]} this month.`;
                            });
                            tmpOnlineString+= `</ul>`;
                            return tmpOnlineString;
                          }
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div id="spendingSummary">
                  <div class="card" style="width: 100%;">
                    <div class="card-body">
                      <h5 class="card-title">Spending Summary</h5>
                      <p class="card-text">
                        <table>
                          <tr>
                            <th>Category</th>
                            <th>Amount Spent</th>
                            <th>Percent of Total Spending</th>
                          </tr>
                          ${ (function spendingSummary() {
                            // First find percentages of all values, and put them into an Array of objects
                            var percentObject = [];
                            if (calItems.eatingout.total > 0) {
                              let tmpJ = { name: 'Eating Out', total: calItems.eatingout.total.toFixed(2), percent: returnPercent(calItems.eatingout.total, calItems.global.totalSpent).toFixed(1) };
                              percentObject.push(tmpJ);
                            }
                            if (calItems.carpayment.total > 0) {
                              let tmpJ = { name: 'Car Payment', total: calItems.carpayment.total.toFixed(2), percent: returnPercent(calItems.carpayment.total, calItems.global.totalSpent).toFixed(1) };
                              percentObject.push(tmpJ);
                            }
                            if (calItems.onlinesubscriptions.total > 0) {
                              let tmpJ = { name: 'Online Subscriptions', total: calItems.onlinesubscriptions.total.toFixed(2), percent: returnPercent(calItems.onlinesubscriptions.total, calItems.global.totalSpent).toFixed(1) };
                              percentObject.push(tmpJ);
                            }
                            if (calItems.carinsurance.total > 0) {
                              let tmpJ = { name: 'Car Insurance', total: calItems.carinsurance.total.toFixed(2), percent: returnPercent(calItems.carinsurance.total, calItems.global.totalSpent).toFixed(1) };
                              percentObject.push(tmpJ);
                            }
                            if (calItems.food.total > 0) {
                              let tmpJ = { name: 'Food', total: calItems.food.total.toFixed(2), percent: returnPercent(calItems.food.total, calItems.global.totalSpent).toFixed(1) };
                              percentObject.push(tmpJ);
                            }
                            if (calItems.hobbies.total > 0) {
                              let tmpJ = { name: 'Hobbies', total: calItems.hobbies.total.toFixed(2), percent: returnPercent(calItems.hobbies.total, calItems.global.totalSpent).toFixed(1) };
                              percentObject.push(tmpJ);
                            }
                            if (calItems.storage.total > 0) {
                              let tmpJ = { name: 'Storage Unit', total: calItems.storage.total.toFixed(2), percent: returnPercent(calItems.storage.total, calItems.global.totalSpent).toFixed(1) };
                              percentObject.push(tmpJ);
                            }
                            if (calItems.rent.total > 0) {
                              let tmpJ = { name: 'Rent', total: calItems.rent.total.toFixed(2), percent: returnPercent(calItems.rent.total, calItems.global.totalSpent).toFixed(1)};
                              percentObject.push(tmpJ);
                            }
                            if (calItems.gas.total > 0) {
                              let tmpJ = { name: 'Gas', total: calItems.gas.total.toFixed(2), percent: returnPercent(calItems.gas.total, calItems.global.totalSpent).toFixed(1)};
                              percentObject.push(tmpJ);
                            }
                            if (calItems.creditcard.total > 0) {
                              let tmpJ = {name:'Credit Card', total: calItems.creditcard.total.toFixed(2), percent:returnPercent(calItems.creditcard.total, calItems.global.totalSpent).toFixed(1)};
                              percentObject.push(tmpJ);
                            }
                            if (calItems.activities.total > 0) {
                              let tmpJ = {name:'Activities',total:calItems.activities.total.toFixed(2), percent:returnPercent(calItems.activities.total, calItems.global.totalSpent).toFixed(1)};
                              percentObject.push(tmpJ);
                            }
                            if (calItems.pets.total > 0) {
                              let tmpJ = {name:'Pets', total:calItems.pets.total.toFixed(2), percent:returnPercent(calItems.pets.total, calItems.global.totalSpent).toFixed(1)};
                              percentObject.push(tmpJ);
                            }
                            if (calItems.vices.total > 0) {
                              let tmpJ = { name: 'Vices', total: calItems.vices.total.toFixed(2), percent:returnPercent(calItems.vices.total, calItems.global.totalSpent).toFixed(1)};
                              percentObject.push(tmpJ);
                            }
                            if (calItems.savings.total > 0) {
                              let tmpJ = { name: 'Savings', total: calItems.savings.total.toFixed(2), percent: returnPercent(calItems.savings.total, calItems.global.totalSpent).toFixed(1)};
                              percentObject.push(tmpJ);
                            }
                            if (calItems.clothing.total > 0) {
                              let tmpJ = { name: 'Clothing', total: calItems.clothing.total.toFixed(2), percent: returnPercent(calItems.clothing.total, calItems.global.totalSpent).toFixed(1)};
                              percentObject.push(tmpJ);
                            }
                            if (calItems.householdgoods.total > 0) {
                              let tmpJ = { name: 'Household Goods', total: calItems.householdgoods.total.toFixed(2), percent: returnPercent(calItems.householdgoods.total, calItems.global.totalSpent).toFixed(2)};
                              percentObject.push(tmpJ);
                            }
                            if (calItems.other.total > 0) {
                              let tmpJ = { name: 'Other', total: calItems.other.total.toFixed(2), percent: returnPercent(calItems.other.total, calItems.global.totalSpent).toFixed(1)};
                              percentObject.push(tmpJ);
                            }

                            percentObject.sort(function (a,b) {
                              return b.percent - a.percent;
                            });
                            var tmpPercentString = '';
                            percentObject.forEach((data, index) => {
                              tmpPercentString += `<tr><td>${data.name}:</td><td>$${data.total}</td><td>${data.percent}%</td></tr>`;
                              //tmpPercentString += `<li>${data.name}: At <mark class="spent">$${data.total}</mark> is <mark class="percent">${data.percent}%</mark> of your Total Spending.</li>`;
                            });
                            return tmpPercentString;
                          })()}
                        </table>

                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col">
                <div id="otherData">
                  <div class="card" style="width: 100%;">
                    <div class="card-body">
                      <h5 class="card-title">'Other' Spending Data</h5>
                      <p class="card-text">
                        <table>
                          <tr>
                            <th>Amount Spent</th>
                            <th>Percent of Total Spending</th>
                            <th>Description</th>
                            <th>Date</th>
                          </tr>
                          ${ (function otherData() {
                            var tmpOtherData = '';
                            calItems.other.individualData.forEach((data, index) => {
                              tmpOtherData += `<tr><td>$${data.price}</td><td>${returnPercent(data.price, calItems.global.totalSpent).toFixed(1)}%</td><td>${data.optionals.chaseRaw.Description}</td><td>${data.day}</td> </tr>`;
                            });
                            return tmpOtherData;
                          })()}
                        </table>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            </div>
          </div>
        </div>
        `;

      return injectHtml;

    } catch(err) {
      console.log(err);
    }
  }

}

function returnPercent(partialValue, totalValue) {
  return (100 * partialValue) / totalValue;
}

function importChase() {
  // This function will only be able to handle the import of Chase Bank CSV Data, last tested on September 25th, 2021
  // This will expect that no data is within the rawData global variable
  // Below is the expected fields of the CSV
  // Details    Posting Date    Description     Amount    Type        Balance     Check or Slip #
  // DEBIT      9/24/2021       Subway....      -7        DEBIT_CARD  FLOATNUM

  const parse = require('csv-parse');
  const assert = require('assert');
  const electron = require('electron');
  const dialog = electron.remote.dialog;

  rawData = [];

  let fileResult = dialog.showOpenDialogSync({
    title: "Select Chase Bank CSV",
    buttonLabel: "Choose File",
    properties: ['openFile', 'dontAddToRecent']
  });

  if (fileResult === undefined) {
    console.log("No Directory Selected");
  } else {
    console.log(`Result of the File Pick: ${fileResult}`);
    console.log(fileResult);

    let rawChaseImport = fs.readFileSync(fileResult[0]);
    const chaseCSVRecords = parse(rawChaseImport, {
      //columns: true,
      //skip_empty_lines: true
      relax_column_count: true
    }, function(err, records) {
      if (err) {
        console.error(err);
      } else {

        var tmpFullRecordsChaseCSV = [];
        records.forEach((data, index) => {
          let tmpChaseJson = {
            'Details': records[index][0],
            'Posting Date': records[index][1],
            'Description': records[index][2],
            'Amount': records[index][3],
            'Type': records[index][4],
            'Balance': records[index][5],
            'Check or Slip #': records[index][6]
          }

          tmpFullRecordsChaseCSV.push(tmpChaseJson);
        });

        // Since I know the first item in the index will be the header items from the CSV they can be removed
        let csvHeadersRemove = tmpFullRecordsChaseCSV.shift();

        console.log(tmpFullRecordsChaseCSV);

        const chaseTimeConvert = function(timeToConvert) {
          // My Chase Date: MM/DD/YYYY
          // RawData Date: YYYY-MM-DD

          let splitDate = timeToConvert.split('/');
          return `${splitDate[2]}-${splitDate[0]}-${splitDate[1]}`;
        };

        // Now this needs to be converted into data that can be useful to already exisitng structure
        // An Array of Items with
        // Price, Category, Day, Event (Online subscriptions), Location (Eating Out), then of Course can have something with the raw data
        tmpFullRecordsChaseCSV.forEach((data, index) => {
          //console.log(`Testing Math: Value: ${data.Amount}; Minus One: ${data.Amount - 1}`);
          let tmpJsonPrice = 0;
          let tmpJsonCategory = '';
          let tmpJsonDay = '';
          let tmpJsonEvent = '';
          let tmpJsonLocation = '';

          if (data.Amount < 0) {
            // Since the raw data has any payments as negative numbers this will handle payments

            // Test to see if determineCategory works.
            try {
              //console.log(`Category: ${determineCategory(data.Description)}; Phrase: ${data.Description}`);

              let tmpDetermineCategory = determineCategory(data.Description);

              tmpJsonPrice = Math.abs(data.Amount); // Remove the '-' from charged items for this data
              tmpJsonCategory = tmpDetermineCategory[0];
              tmpJsonDay = chaseTimeConvert(data['Posting Date']);

              if (tmpJsonCategory == 'onlinesubscriptions') {
                tmpJsonEvent = tmpDetermineCategory[1];
              } else if (tmpJsonCategory == 'eatingout') {
                tmpJsonLocation = tmpDetermineCategory[1];
              }

              let tmpJsonTotal = {
                category: tmpJsonCategory,
                day: tmpJsonDay,
                price: tmpJsonPrice,
                optionals: {
                  event: tmpJsonEvent,
                  location: tmpJsonLocation,
                  chaseRaw: data
                }
              };

              console.log(tmpJsonTotal);
              rawData.unshift(tmpJsonTotal);
            } catch(er) {
              console.log(er);
            }
          } else {
            // Since the raw data has any payments as negative numbers, this can handle all income
            tmpJsonCategory = 'income';
            tmpJsonPrice = Math.abs(data.Amount);
            tmpJsonDay = chaseTimeConvert(data['Posting Date']);

            let tmpJsonTotal = {
              category: tmpJsonCategory,
              day: tmpJsonDay,
              price: tmpJsonPrice,
              optionals: {
                event: '',
                location: '',
                chaseRaw: data
              }
            };

            rawData.unshift(tmpJsonTotal);
            // The day data should be in raw as YYYY-MM-DD, but in the CSV for me at least is MM/DD/YYYY
          }
        });
      }
    });
  }
}

function determineCategory(phrase) {
  console.log(`determineCategory Called with: ${phrase}`);
  // This function will be dedicated to determining the proper category from the list I've created that the particular phrase
  // belongs to
  // The proper list is in the global array categoryList stored in a friendly manner, and is usually converted to the
  // calculation friendly method during the calculation. This should aslo be returned according to its friendly format
  // Also since income is very easy to determine this doesn't have to be handled here.
  // This is also very personal and is not a uniform solution
  // Some super personal items should maybe even be stored outside of here to prevent doxxing myself based on certain ways to pay
  // By putting certain matching parameters within an env file. To exclude the matching strings from the github file
  // Example: Rent Payment, Car, insurance, credit card, storage,
  // This could also even make it more universal by allowing arrays of these matching items to be put elsewhere for others
  // To properly find others activities or adding additional eating out items, by not modifying the source, and making it writable
  // through settings of the application
  // possibly having a list of uncatagorized items
  // Although some of these can be universal and not doxxing in nature and should be included

  const inc = specificWord => phrase.toLowerCase().includes(specificWord);
  const lower = specificPhrase => specificPhrase.toLowerCase();
  const allEqual = arr => arr.every(val => val === arr[0]);

  var totalChecks = 17;
  var currentChecks = 0;

  var potentialMatch = [];

  var optExtra = '';

  // These arrays can contain data as I see them, since they later on should be merged with my private arrays to not dox myself
  var eatingoutArrayStrongType = ['DOORDASH', 'POPEYES', 'Subway', 'Panda Express', "Wendy's", 'Jack in the Box', "RAISING CANE'S", 'TACO BELL', 'STARBUCKS STORE' ];
  var foodArrayStrongType = [ 'NOT_LEAVING_EMPTY_TO_AVOID_TOTAL_CHECK_BUG'];
  var hobbiesArrayStrongType = [];
  var carpaymentArrayStrongType = [];
  var storageArrayStrongType = [];
  var rentArrayStrongType = [];
  var carinsuranceArrayStrongType = [];
  var creditcardArrayStrongType = [];
  var giftsArrayStrongType = [ 'NOT_LEAVING_EMPTY_TO_AVOID_TOTAL_CHECK_BUG'];
  var activitiesArrayStrongType = [];
  var petsArrayStrongType = [];
  var vicesArrayStrongType = [];
  var savingsArrayStrongType = [];
  var clothingArrayStrongType = [ 'NOT_LEAVING_EMPTY_TO_AVOID_TOTAL_CHECK_BUG' ];
  var householdgoodsArrayStrongType = [];
  var onlinesubscriptionsArrayStrongType = ['CRUNCHYROLL *MEMBERSH', 'GOOGLE *YouTubePremiu', 'PRIVATEINTE', 'Amazon Prime' ];
  var gasArrayStrongType = ['SHELL SERVICE STATION' ];

  var eatingoutFriendlyStrongType = [ [ 'DoorDash', 'DOORDASH' ], ['Popeyes', 'POPEYES'], ['Subway', 'Subway'], ['Panda Express', 'Panda Express'],
                ["Wendy's", "Wendy's"], ['Jack in the Box', 'Jack in the Box'], ["Raising Cane's", "RAISING CANE'S"], ['Taco Bell', 'TACO BELL'], ['Starbucks', 'STARBUCKS STORE'] ];
  var onlinesubscriptionsFriendlyStrongType = [ ['Crunchyroll', 'CRUNCHYROLL *MEMBERSH'], ['YouTube Premium', 'GOOGLE *YouTubePremiu'], ['Private Internet Access', 'PRIVATEINTE'], ['Amazon Prime', 'Amazon Prime'] ];

  var jsonCategoryJSON;
  try {
    let rawCategoryJSON = fs.readFileSync('./matching/category.json');
    jsonCategoryJSON = JSON.parse(rawCategoryJSON);
  } catch(err) {
    console.log(err);
  }
  //let rawCategoryJSON = fs.readFileSync('./matching/category.json');
  //let jsonCategoryJSON = JSON.parse(rawCategoryJSON);

  // Now combine the arrays from here with the strong typed ones
  var eatingoutArray = eatingoutArrayStrongType.concat(jsonCategoryJSON.eatingout);
  var onlinesubscriptionsArray = onlinesubscriptionsArrayStrongType.concat(jsonCategoryJSON.onlinesubscriptions);
  var gasArray = gasArrayStrongType.concat(jsonCategoryJSON.gas);
  var foodArray = foodArrayStrongType.concat(jsonCategoryJSON.food);
  var hobbiesArray = hobbiesArrayStrongType.concat(jsonCategoryJSON.hobbies);
  var carpaymentArray = carpaymentArrayStrongType.concat(jsonCategoryJSON.carpayment);
  var storageArray = storageArrayStrongType.concat(jsonCategoryJSON.storage);
  var rentArray = rentArrayStrongType.concat(jsonCategoryJSON.rent);
  var carinsuranceArray = carinsuranceArrayStrongType.concat(jsonCategoryJSON.carinsurance);
  var creditcardArray = creditcardArrayStrongType.concat(jsonCategoryJSON.creditcard);
  var giftsArray = giftsArrayStrongType.concat(jsonCategoryJSON.gifts);
  var activitiesArray = activitiesArrayStrongType.concat(jsonCategoryJSON.activities);
  var petsArray = petsArrayStrongType.concat(jsonCategoryJSON.pets);
  var vicesArray = vicesArrayStrongType.concat(jsonCategoryJSON.vices);
  var savingsArray = savingsArrayStrongType.concat(jsonCategoryJSON.savings);
  var clothingArray = clothingArrayStrongType.concat(jsonCategoryJSON.clothing);
  var householdgoodsArray = householdgoodsArrayStrongType.concat(jsonCategoryJSON.householdgoods);

  var eatingoutFriendly = eatingoutFriendlyStrongType.concat(jsonCategoryJSON.eatingoutFriendly);
  var onlinesubscriptionsFriendly = onlinesubscriptionsFriendlyStrongType.concat(jsonCategoryJSON.onlinesubscriptionsFriendly);


  eatingoutArray.forEach((data, index) => {
    //console.log(`eatingoutArray: ${data}; incLower: ${inc(lower(data))}`);
    if (inc(lower(data))) {
      potentialMatch.push('eatingout');

      // now that the match has been determined to be eatingout, we can add the extra data
      eatingoutFriendly.forEach((dataFriendly, index) => {
        if (dataFriendly[1] == data) {
          optExtra = dataFriendly[0];
        }
      });
    }

    if (index == eatingoutArray.length -1) {
      //console.log(`Adding to Current Checks: ${currentChecks}`);
      currentChecks++;
      //finishedCheck();
    }
  });

  onlinesubscriptionsArray.forEach((data, index) => {
    //console.log(`oneline`);
    if (inc(lower(data))) {
      potentialMatch.push('onlinesubscriptions');

      // Now that the match has been determined to be online sub we can add the extra data
      onlinesubscriptionsFriendly.forEach((dataFriendly, index) => {
        if (dataFriendly[1] == data) {
          optExtra = dataFriendly[0];
        }
      });
    }
    if (index == onlinesubscriptionsArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });

  gasArray.forEach((data, index) => {
    //console.log('gas');
    if (inc(lower(data))) {
      potentialMatch.push('gas');
    }
    if (index == gasArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });

  foodArray.forEach((data, index) => {
    //console.log('food');
    if (inc(lower(data))) {
      potentialMatch.push('food');
    }
    if (index == foodArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });

  hobbiesArray.forEach((data, index) => {
    //console.log('hobbies');
    if (inc(lower(data))) {
      potentialMatch.push('hobbies');
    }
    if (index == hobbiesArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });
  carpaymentArray.forEach((data, index) => {
    //console.log('carpayment');
    if (inc(lower(data))) {
      potentialMatch.push('carpayment');
    }
    if (index == carpaymentArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });
  storageArray.forEach((data, index) => {
    //console.log('storage');
    if (inc(lower(data))) {
      potentialMatch.push('storage');
    }
    if (index == storageArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });
  rentArray.forEach((data, index) => {
    //console.log('rent');
    if (inc(lower(data))) {
      potentialMatch.push('rent');
    }
    if (index == rentArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });
  carinsuranceArray.forEach((data, index) => {
    //console.log('carinsurance');
    if (inc(lower(data))) {
      potentialMatch.push('carinsurance');
    }
    if (index == carinsuranceArray.length -1) {
      currentChecks++;
    }
  });
  creditcardArray.forEach((data, index) => {
    //console.log('creditcard');
    if (inc(lower(data))) {
      potentialMatch.push('creditcard');
    }
    if (index == creditcardArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });
  giftsArray.forEach((data, index) => {
    //console.log('gifts');
    if (inc(lower(data))) {
      potentialMatch.push('gifts');
    }
    if (index == giftsArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });
  activitiesArray.forEach((data, index) => {
    //console.log('activities');
    if (inc(lower(data))) {
      potentialMatch.push('activities');
    }
    if (index == activitiesArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });
  petsArray.forEach((data, index) => {
    //console.log('pets');
    if (inc(lower(data))) {
      potentialMatch.push('pets');
    }
    if (index == petsArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });
  vicesArray.forEach((data, index) => {
    //console.log('vices');
    if (inc(lower(data))) {
      potentialMatch.push('vices');
    }
    if (index == vicesArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });
  savingsArray.forEach((data, index) => {
    //console.log('savings');
    if (inc(lower(data))) {
      potentialMatch.push('savings');
    }
    if (index == savingsArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });
  clothingArray.forEach((data, index) => {

    if (inc(lower(data))) {
      potentialMatch.push('clothing');
    }
    if (index == clothingArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });
  householdgoodsArray.forEach((data, index) => {
    if (inc(lower(data))) {
      potentialMatch.push('householdgoods');
    }
    if (index == householdgoodsArray.length -1) {
      currentChecks++;
      //finishedCheck();
    }
  });


  //console.log(`About to check Checks: ${currentChecks == totalChecks}; Current: ${currentChecks}; Total: ${totalChecks}`);
  if (currentChecks == totalChecks) {
  //  console.log(`All Checks done. Potential Matches: ${potentialMatch}`);
    if (potentialMatch.length < 2 && potentialMatch.length != 0) {
      // This means only one Item triggered a potential match
  //    console.log(potentialMatch[0]);
      return [ potentialMatch[0], optExtra ];
    } else if (potentialMatch.length == 0) {
      // this means nothing has triggered a potential match
      return [ 'other' ];
    } else {
      // Means there were multiple potential matches and there needs to be a way to choose one
      // It may be likely that one item can trigger multiple of the same category (ie. DOORDASH*PANDA EXPRESS) and that should be checked first
      if (allEqual(potentialMatch)) {
        // this would indicate that the same category was chosen several times
  //      console.log(potentialMatch[0]);
        return [ potentialMatch[0], optExtra ];
      } else {
        // Indicates that the potential matches are different
      }
    }
  }
}

// This will be the bulk af all calculations being done.

var itemsProcessed = 0;
var processingDone = false;

var itemTotals = {
  eatingout: 0,
  food: 0,
  hobbies: 0,
  carpayment: 0,
  storage: 0,
  rent: 0,
  insurance: 0,
  gas: 0,
  credit: 0,
  gifts: 0,
  activities: 0,
  onlinesub: 0,
  pets: 0,
  vices: 0,
  savings: 0,
  clothing: 0
};

rawData.forEach((data, index) => {
  console.log('For Each in review...');

  if (rawData[index].category == 'eatingout') {
    itemTotals.eatingout += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'hobbies') {
    itemTotals.hobbies += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'carpayment') {
    itemTotals.carpayment += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'storage') {
    itemTotals.storage += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'rent') {
    itemTotals.rent = rawData[index].price + itemTotals.rent;
    itemsProcessed++;
  } else if (rawData[index].category == 'insurance') {
    itemTotals.insurance += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'gas') {
    itemTotals.gas = rawData[index].price + itemTotals.gas;
    itemsProcessed++;
  } else if (rawData[index].category == 'credit') {
    itemTotals.credit += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'gifts') {
    itemTotals.gifts += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'activities') {
    itemTotals.activities += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'onlinesub') {
    itemTotals.onlinesub += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'pets') {
    itemTotals.pets += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'vices') {
    itemTotals.vices += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'savings') {
    itemTotals.savings += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'clothing') {
    itemTotals.clothing += rawData[index].price;
    itemsProcessed++;
  } else if (rawData[index].category == 'food') {
    itemTotals.food += rawData[index].price;
    itemsProcessed++;
  }

  if (itemsProcessed - 1 == index) {
    console.log('Finished Processing Items...');
    processingDone = true;
  }
  console.log(`itemsProcessed: ${itemsProcessed} || index: ${index}`);
  console.log(`Test: ${ rawData[index].category}`);
});

if (processingDone) {

  //document.getElementById('main-page').innerHTML += injectHtml;

  var chartTitle = 'Total Spending';
  const drawChartStr = `
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Category');
    data.addColumn('number', 'Total Cost');
    data.addRows([
      ['Food', ${itemTotals.food}],
      ['Eating Out', ${itemTotals.eatingout}],
      ['Hobbies', ${itemTotals.hobbies}],
      ['Car Payment', ${itemTotals.carpayment}],
      ['Storage', ${itemTotals.storage}],
      ['Rent', ${itemTotals.rent}],
      ['Insurance', ${itemTotals.insurance}],
      ['Gas', ${itemTotals.gas}],
      ['Credit Card', ${itemTotals.credit}],
      ['Gifts', ${itemTotals.gifts}],
      ['Activities', ${itemTotals.activities}],
      ['Online Subscriptions', ${itemTotals.onlinesub}],
      ['Pets', ${itemTotals.pets}],
      ['Vices', ${itemTotals.vices}],
      ['Savings', ${itemTotals.savings}],
      ['Clothing', ${itemTotals.clothing}],
    ]);
    //const data = new google.api.visualization.arrayToDataTable([
    //  ['Category', 'Total Cost'],
    //  ['Food',        ${itemTotals.food}],
    //]);

    var options = {
      title: '${chartTitle}',
    };
    var chart = new google.visualization.PieChart(document.getElementById('totalPiechart'));
    chart.draw(data, options);
    `;
    console.log(drawChartStr);
    try {
    const image = await GoogleChartsNode.render(drawChartStr, {
      width: 400,
      height: 300,
    });
  } catch(err) {
    console.log(err);
  }

    var injectHtml = [
      `<div id="totalPiechart">
        <img src="./tmp/totalPiechart.png" />
        <img src="data:image/png;base64, ${image.toString('base64')}" />
      </div>
      <div id="breakdownText">
      <ul>
        <li> You spent a total of ${itemTotals.eatingout} on Eating Out this month. </li>
        <li> You also Ate Out ${rawData.}
      </ul>`
    ].join("\n");

    resolve(injectHtml);

}

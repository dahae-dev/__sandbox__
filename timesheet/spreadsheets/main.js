/* eslint-disable @typescript-eslint/no-use-before-define */
const { google } = require('googleapis');
const keys = require('./nodejs-ga-api-test-9f57f397cffd.json');

const client = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

client.authorize((err, tokens) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected!');
    gsrun(client);
  }

});

async function gsrun(client) {
  const sheetsAPI = google.sheets({ version: 'v4', auth: client })
  const option = {
    spreadsheetId: '1JeMa6a0KnH0vx7k8NpHePyn8PVAMY9gobLdE6s645rM',
    range: 'WORKLOAD_2019!D4:F8',
  }
  const data = await sheetsAPI.spreadsheets.values.get(option);
  const dataArray = data.data.values;
  // console.log(dataArray)
  const newDataArray = dataArray.map((el) => [el[2] + el[0]]);
  console.log(newDataArray)

  const updateOptions = {
    spreadsheetId: '1JeMa6a0KnH0vx7k8NpHePyn8PVAMY9gobLdE6s645rM',
    range: 'WORKLOAD_2019!A4',
    valueInputOption: 'USER_ENTERED',
    resource: { values: newDataArray },
  }

  const response = await sheetsAPI.spreadsheets.values.update(updateOptions);
  console.log(response);
}

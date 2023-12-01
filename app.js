const fs = require('fs');
const axios = require('axios');

const apiUrl = 'https://catfact.ninja/breeds';
const outputFile = 'catBreedsData.txt';

async function fetchData(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
    throw error;
  }
}

async function logResponseToFile(data, fileName) {
  try {
    await fs.promises.writeFile(fileName, JSON.stringify(data, null, 2));
    console.log(`Response logged to ${fileName}`);
  } catch (error) {
    console.error('Error writing to file:', error.message);
  }
}
async function getAllPagesRecursive(url, allData = []) {
  const pageData = await fetchData(url);
  allData = allData.concat(pageData.data);
  if (pageData.next_page_url) {
    return getAllPagesRecursive(pageData.next_page_url, allData);
  } else {
    return allData;
  }
}

function groupByCountry(data) {
  const groupedData = {};
  data.forEach((breed) => {
    const country = breed.country || 'Unknown';

    if (!groupedData[country]) {
      groupedData[country] = [];
    }
    groupedData[country].push({
      breed: breed.breed || 'Unknown',
      origin: breed.origin || 'Unknown',
      coat: breed.coat || 'Unknown',
      pattern: breed.pattern || 'Unknown',
    });
  });

  return groupedData;
}

async function main() {
  try {
    const allBreedsData = await getAllPagesRecursive(apiUrl);
    await logResponseToFile(allBreedsData, outputFile);
    const groupedByCountry = groupByCountry(allBreedsData);
    console.log(JSON.stringify(groupedByCountry, null, 2));
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

//  main function calling 
main();

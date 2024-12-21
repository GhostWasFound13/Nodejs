const axios = require('axios');
const fs = require('fs');
const path = require('path');

// API endpoints for some-random-api
const apiEndpoints = {
  dog: "https://some-random-api.com/animal/dog",
  cat: "https://some-random-api.com/animal/cat",
  panda: "https://some-random-api.com/animal/panda",
  fox: "https://some-random-api.com/animal/fox",
  koala: "https://some-random-api.com/animal/koala",
  bird: "https://some-random-api.com/animal/bird",
  raccoon: "https://some-random-api.com/animal/raccoon",
  kangaroo: "https://some-random-api.com/animal/kangaroo"
};

// Ensure a directory exists
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
}

// Read existing JSON data or return an empty array
function readExistingData(filePath) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

// Append new data to a JSON file
function appendToFile(folder, fileName, newData) {
  const filePath = path.join(folder, fileName);

  // Read existing data
  let existingData = readExistingData(filePath);

  // Ensure existingData is an array (in case of unexpected data format)
  if (!Array.isArray(existingData)) {
    existingData = [];
  }

  // Append new data
  existingData.push(newData);

  // Write updated data back to the file
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
 // console.log(`Appended data to ${filePath}`);
}

// Fetch data from a specific API endpoint with retry on 429 (rate limit)
async function fetchAnimalData(animal, url) {
  try {
    const response = await axios.get(url);
    const animalData = response.data;

    // Create a folder for the animal
    const folderPath = path.join(__dirname, 'animal_data', animal);
    ensureDirectoryExists(folderPath);

    // Append data to the JSON file in the folder
    appendToFile(folderPath, `${animal}.json`, animalData);
  } catch (error) {
    if (error.response) {
      // Handle specific HTTP errors
      if (error.response.status === 404) {
        console.error(`Error 404: Data for ${animal} not found.`);
      } else if (error.response.status === 402) {
        console.error(`Error 402: Payment required for ${animal}.`);
      } else if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 1; // Default to 1 second if not provided
        console.error(`Error 429: Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000)); // Wait before retrying
        await fetchAnimalData(animal, url); // Retry fetching the data
      } else {
        console.error(`HTTP Error ${error.response.status}: Unable to fetch ${animal} data.`);
      }
    } else {
      // General errors (network issues, timeouts, etc.)
      console.error(`Error fetching ${animal}:`, error.message);
    }
  }
}

// Fetch data from all endpoints and append them
async function fetchAndSaveAllAnimals() {
  while (true) { // Infinite loop
  //  console.log("Starting a new fetch cycle...");
    for (const [animal, url] of Object.entries(apiEndpoints)) {
  //    console.log(`Fetching data for ${animal}...`);
      await fetchAnimalData(animal, url);
    }
 //   console.log("Fetch cycle complete. Restarting in 1 second...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between cycles
  }
}

// Run the function
fetchAndSaveAllAnimals();
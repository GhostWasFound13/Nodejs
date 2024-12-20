const axios = require('axios');
const fs = require('fs');
const path = require('path');

// List of API endpoints for some-random-api
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

// Read existing JSON file or return an empty array
function readExistingData(filePath) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

// Save data to a JSON file (append mode)
function appendToFile(folder, fileName, newData) {
  const filePath = path.join(folder, fileName);

  // Read existing data
  const existingData = readExistingData(filePath);

  // Append new data
  existingData.push(newData);

  // Write updated data back to the file
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
  console.log(`Appended data to ${filePath}`);
}

// Fetch data from all endpoints and append them
async function fetchAndSaveAllAnimals() {
  while (true) { // Infinite loop
    console.log("Starting a new fetch cycle...");
    try {
      for (const [animal, url] of Object.entries(apiEndpoints)) {
        console.log(`Fetching data for ${animal}...`);
        const response = await axios.get(url);
        const animalData = response.data;

        // Create a folder for the animal
        const folderPath = path.join(__dirname, 'animal_data', animal);
        ensureDirectoryExists(folderPath);

        // Append data to the JSON file in the folder
        appendToFile(folderPath, `${animal}.json`, animalData);
      }
      console.log("Fetch cycle complete. Restarting...");
    } catch (error) {
      console.error("Error during fetch:", error.message);
    }

    // Wait before starting the next cycle (optional)
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds delay
  }
}

// Run the function
fetchAndSaveAllAnimals();
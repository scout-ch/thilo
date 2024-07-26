const axios = require('axios');
const fs = require('fs');
const path = require('path');

const backendURL = "https://api.thilo.scouts.ch/";

const mainAPIs = [
  "links",
  "start-page",
  "sections"
];

const locale = [
  "de",
  "fr",
  "it"
];

function checkIfDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function fetchData() {
  for (const api of mainAPIs) {
    for (const lang of locale) {
      const url = `${backendURL}${api}?_locale=${lang}`;
      console.log("Requesting " + url);

      try {
        const response = await axios.get(url);
        let data = response.data;

        // if section apply filter
        if (api === "sections") {
          data = data.filter(item => item.published_at !== null);


          data.forEach(element => {
            if (element && element.chapters.length > 0) {
              element.chapters = element.chapters.filter(item => item.published_at !== null);
            }
          });
        }

        // export to subfolder
        const workingDir = "exports/";
        checkIfDirExists(workingDir);

        const filePath = path.join(workingDir, `${api}-${lang}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));

        console.log("Done with " + `${api}-${lang}.json`);
      } catch (error) {
        console.error("Error fetching " + url, error);
      }
    }
    console.log("Done with " + api);
  }
  console.log("Done with all APIs");
}

fetchData();

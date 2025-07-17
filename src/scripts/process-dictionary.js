import fs from "fs";
import path from "path";

const resourcesPath = path.join(process.cwd(), "src/resources");
const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

async function processDictionary() {
  console.log("Starting dictionary processing...");

  // Read all dictionary files and combine them into one array
  let allWords = [];
  console.log("Reading all source files...");
  for (const letter of alphabet) {
    const filePath = path.join(
      resourcesPath,
      `BengaliDictionary-${letter}.json`
    );
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const words = JSON.parse(fileContent);
        allWords.push(...words);
      }
    } catch (error) {
      console.error(
        `Error reading or parsing file for letter '${letter}':`,
        error
      );
    }
  }
  console.log(`Read a total of ${allWords.length} word entries.`);

  // Group words by the lowercased 'en' key
  console.log("Grouping words by 'en' key...");
  const groupedByEn = new Map();
  allWords.forEach((word) => {
    if (!word.en) return; // Skip entries without an 'en' key
    const enKey = word.en.toLowerCase();
    word.en = enKey; // Standardize the key to lowercase

    if (!groupedByEn.has(enKey)) {
      groupedByEn.set(enKey, []);
    }
    groupedByEn.get(enKey).push(word);
  });

  //  Merge the grouped words, combining and uniquing array properties
  console.log("Merging duplicate entries...");
  const mergedWords = [];
  for (const group of groupedByEn.values()) {
    const mergedEntry = group.reduce(
      (acc, current) => {
        // For each property that is an array, flatten and collect all values
        [
          "pos",
          "pron",
          "sents",
          "bn_syns",
          "en_syns",
          "bn_antonyms",
          "en_antonyms",
        ].forEach((key) => {
          if (current[key] && Array.isArray(current[key])) {
            acc[key] = (acc[key] || []).concat(current[key]);
          }
        });
        return acc;
      },
      { en: group[0].en, bn: group[0].bn }
    ); // Start with the 'en' and 'bn' from the first entry

    // Make all array properties unique
    Object.keys(mergedEntry).forEach((key) => {
      if (Array.isArray(mergedEntry[key])) {
        mergedEntry[key] = [...new Set(mergedEntry[key])];
      }
    });

    mergedWords.push(mergedEntry);
  }
  console.log(`Merged down to ${mergedWords.length} unique word entries.`);

  // Re-split the cleaned data back into letter-based files
  console.log("Re-splitting data and writing new files...");
  const wordsByLetter = new Map();
  mergedWords.forEach((word) => {
    const firstLetter = word.en.charAt(0);
    if (!wordsByLetter.has(firstLetter)) {
      wordsByLetter.set(firstLetter, []);
    }
    wordsByLetter.get(firstLetter).push(word);
  });

  for (const letter of alphabet) {
    const filePath = path.join(
      resourcesPath,
      `BengaliDictionary-${letter}.json`
    );
    const wordsForFile = wordsByLetter.get(letter) || [];

    const newContent = JSON.stringify(wordsForFile, null, 2);
    fs.writeFileSync(filePath, newContent, "utf-8");
  }

  console.log("Success! Dictionary processing complete.");
}

processDictionary();

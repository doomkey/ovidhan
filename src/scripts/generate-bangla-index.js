import fs from "fs";
import path from "path";
const resourcesPath = path.join(process.cwd(), "src/resources");
const outputPath = path.join(process.cwd(), "src/generated/bangla-index.json");
const outputDir = path.dirname(outputPath);

async function generateBanglaIndex() {
  console.log("Starting Bangla index generation...");
  // The index will map a Bangla word to its location { f, i }
  const banglaIndex = new Map();
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  for (const letter of alphabet) {
    const filePath = path.join(
      resourcesPath,
      `BengaliDictionary-${letter}.json`
    );
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const words = JSON.parse(fileContent);

        words.forEach((word, index) => {
          const location = { f: letter, i: index };
          // Index the main Bangla word
          if (word.bn && !banglaIndex.has(word.bn)) {
            banglaIndex.set(word.bn, location);
          }

          // Index all Bangla synonyms
          if (word.bn_syns && Array.isArray(word.bn_syns)) {
            word.bn_syns.forEach((syn) => {
              if (!banglaIndex.has(syn)) {
                banglaIndex.set(syn, location);
              }
            });
          }
        });
      }
    } catch (error) {
      console.error(`Error processing file for letter '${letter}':`, error);
    }
  }

  // map to plain
  const indexObject = Object.fromEntries(banglaIndex);

  // minification
  const fileContent = JSON.stringify(indexObject);

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write
  fs.writeFileSync(outputPath, fileContent, "utf-8");
  console.log(
    `Success! Generated Bangla index with ${
      banglaIndex.size
    } keys to ${path.relative(process.cwd(), outputPath)}`
  );
}

generateBanglaIndex();

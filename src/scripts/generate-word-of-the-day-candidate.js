import fs from "fs";
import path from "path";

const resourcesPath = path.join(process.cwd(), "src/resources");
const outputPath = path.join(
  process.cwd(),
  "src/generated/wordOfTheDayCandidates.json"
);
const outputDir = path.dirname(outputPath);

async function generateCandidates() {
  console.log("Starting candidate generation...");
  // Use a map to group indices by file letter
  const candidateMap = new Map();
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
          if (
            word.en_syns &&
            word.bn_syns &&
            word.en_syns.length >= 3 &&
            word.bn_syns.length >= 3
          ) {
            if (!candidateMap.has(letter)) {
              candidateMap.set(letter, []);
            }
            candidateMap.get(letter).push(index);
          }
        });
      }
    } catch (error) {
      console.error(`Error processing file for letter '${letter}':`, error);
    }
  }

  const candidates = Array.from(candidateMap, ([file, indices]) => ({
    file,
    indices,
  }));

  const fileContent = JSON.stringify(candidates);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, fileContent, "utf-8");
  console.log(
    `Success! Generated ${
      candidates.length
    } candidate groups to ${path.relative(process.cwd(), outputPath)}`
  );
}

generateCandidates();

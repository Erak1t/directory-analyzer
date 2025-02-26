const fs = require("fs").promises;
const path = require("path");

async function getStats(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats;
  } catch (err) {
    console.error("Error getting stats", err.message);
    return null;
  }
}

async function analyzeDirectory(directoryPath) {
  try {
    const items = await fs.readdir(directoryPath);
    let totalItems = 0;
    let totalFiles = 0;
    let totalSize = 0;
    let largestFile = { name: "", size: 0 };
    let fileList = [];

    for (const item of items) {
      const itemPath = path.join(directoryPath, item);
      const stats = await getStats(itemPath);
      if (!stats) continue;

      totalItems++;

      if (stats.isFile()) {
        totalFiles++;
        totalSize += stats.size;

        if (stats.size > largestFile.size) {
          largestFile = { name: item, size: stats.size };
        }
        fileList.push({ name: item, size: stats.size });
      } else if (stats.isDirectory()) {
        const subDirectoryStats = await analyzeDirectory(itemPath);
        totalItems += subDirectoryStats.totalItems;
        totalSize += subDirectoryStats.totalSize;
        totalFiles += subDirectoryStats.totalFiles;

        if (subDirectoryStats.largestFile.size > largestFile.size) {
          largestFile = subDirectoryStats.largestFile;
        }

        fileList = fileList.concat(subDirectoryStats.fileList);
      }
    }
    return {
      totalFiles,
      totalItems,
      totalSize,
      largestFile,
      fileList,
    };
  } catch (error) {
    console.error("Error analyzing directory content", error.message);
    return {
      totalItems: 0,
      totalFiles: 0,
      totalSize: 0,
      largestFile: { name: "", size: 0 },
      fileList: [],
    };
  }
}
async function main() {
  const directoryPath = "/Users/erak1t/Documents/My Website";
  const directoryStats = await analyzeDirectory(directoryPath);
  console.log("Directory Analisis:");
  console.log("Total Items:", directoryStats.totalItems);
  console.log("Total Files:", directoryStats.totalFiles);
  console.log("Total Size (bytes):", directoryStats.totalSize);
  console.log(
    "Largest File:",
    directoryStats.largestFile.name,
    "Size:",
    directoryStats.largestFile.size,
    "bytes"
  );
  console.log("\nFile List:");
  for (const file of directoryStats.fileList) {
    console.log(file.name, file.size, "bytes");
  }
}
main();

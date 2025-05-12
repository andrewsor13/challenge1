const parquet = require("parquetjs-lite");

const readData = async (filePath) => {
  const reader = await parquet.ParquetReader.openFile(filePath);
  const cursor = reader.getCursor();
  const links = [];

  let record = null;
  while ((record = await cursor.next())) {
    const siteLink = record.domain;

    if (siteLink) {
      links.push(siteLink);
    }
  }
  await reader.close();
  return links;
};

module.exports = readData;

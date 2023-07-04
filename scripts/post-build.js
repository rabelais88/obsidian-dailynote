const { promises: fs } = require('fs');
const dotenv = require('dotenv');
const path = require('path');
(async () => {
  dotenv.config();
  const { SCRIPT_DEST_PATH } = process.env;
  const SCRIPT_SRC_PATH = path.resolve('./dist');
  console.log('script src path:', SCRIPT_SRC_PATH);
  console.log('script dest path:', SCRIPT_DEST_PATH);
  await fs.cp(SCRIPT_SRC_PATH, SCRIPT_DEST_PATH, {
    recursive: true,
    force: true,
  });
  console.log('script copy finished');
})();

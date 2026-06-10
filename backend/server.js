require("dotenv").config();
const { syncDB } = require("./src/models");
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

syncDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
const connectToMongo = require("./db.js");
const express = require("express");
const cors = require("cors");

connectToMongo();

const app = express();
const port = 3001 || process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/files", require("./routes/files.js"));
app.use("/api/cloud", require("./routes/cloudfiles.js"));
app.use("/api/audit", require("./routes/audit.js"));

app.listen(port, () => {
  console.log(`Redact App listening on port ${port}`);
});

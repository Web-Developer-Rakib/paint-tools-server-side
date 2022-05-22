const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
//Middlewares
app.use(cors());
app.use(express.json());
//DB info

//Test
app.get("/", (req, res) => {
  res.send("Server is running on port 5000");
});
// Server listning
app.listen(port, () => console.log("Server is running on", port));

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
//Middlewares
app.use(cors());
app.use(express.json());
//DB info
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oo3aa.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//Main function
const run = async () => {
  try {
    //DB client connect
    await client.connect();
  } finally {
    //Connection continue
  }
};
run().catch(console.dir);
//Test
app.get("/", (req, res) => {
  res.send("Server is running on port 5000");
});
// Server listning
app.listen(port, () => console.log("Server is running on", port));

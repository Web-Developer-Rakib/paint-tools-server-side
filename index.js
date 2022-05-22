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
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bm8ub.mongodb.net/?retryWrites=true&w=majority`;
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
    //Collections
    const usersCollection = client.db("paint_tools").collection("users");
    //Put users info
    app.put("/put-user", async (req, res) => {
      const usersData = req.body;
      const result = await usersCollection.insertOne(usersData);
      res.send(result);
    });
  } finally {
    //Connection continue
  }
};
run().catch(console.dir);
// Server listning
app.listen(port, () => console.log("Server is running on", port));

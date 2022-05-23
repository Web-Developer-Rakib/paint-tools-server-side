const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const productsCollection = client.db("paint_tools").collection("products");
    const ordersCollection = client.db("paint_tools").collection("orders");
    //Put users info
    app.put("/put-user", async (req, res) => {
      const usersData = req.body;
      const email = usersData.email;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          email: usersData.email,
          admin: usersData.admin,
          name: usersData.name,
        },
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    //Make an admin
    app.put("/make-admin", async (req, res) => {
      const usersData = req.body;
      const email = usersData.usersEmail;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          admin: usersData.admin,
        },
      };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    // Create product
    app.post("/add-product", async (req, res) => {
      const productsData = req.body;
      const result = await productsCollection.insertOne(productsData);
      res.send(result);
    });
    //Get Users
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    //Get all Products
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    //Get a single Product
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });
    //Post orders info
    app.post("/post-order", async (req, res) => {
      const ordersData = req.body;
      const result = await ordersCollection.insertOne(ordersData);
      res.send(result);
    });
  } finally {
    //Connection continue
  }
};
run().catch(console.dir);
// Server listning
app.listen(port, () => console.log("Server is running on", port));

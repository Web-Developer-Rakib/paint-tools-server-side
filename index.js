const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const jwt = require("jsonwebtoken");
//Middlewares
app.use(cors());
app.use(express.json());

// JWT tocken
app.post("/jwt-token", (req, res) => {
  const user = req.body;
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
  res.send({ accessToken });
});
//Verify JWT
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}
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
    const reviewsCollection = client.db("paint_tools").collection("reviews");
    //Put users info
    app.put("/put-user", async (req, res) => {
      const usersData = req.body;
      const email = usersData.email;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          email: usersData.email,
          admin: usersData.admin,
          review: usersData.review,
          name: usersData.name,
          address: usersData.address,
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
    //Update review status
    app.put("/update-review-status", async (req, res) => {
      const reviewStatus = req.body;
      const email = reviewStatus.email;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          review: reviewStatus.review,
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
    //Get all Users
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
    //Get all orders info
    app.get("/orders", async (req, res) => {
      const query = {};
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    //Get a single order info
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await ordersCollection.findOne(query);
      res.send(order);
    });
    //Create payment intent
    app.post("/create-payment-intent", async (req, res) => {
      const product = req.body;
      const price = product.totalPrice;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });

    // Update payment status
    app.patch("/update-payment-status/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
        },
      };
      const updatedPaymentStatus = await ordersCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(updatedPaymentStatus);
    });
    // Delete product
    app.delete("/delete-product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    //Post a review
    app.post("/add-review", async (req, res) => {
      const reviewsData = req.body;
      const result = await reviewsCollection.insertOne(reviewsData);
      res.send(result);
    });
    //Update users info
    app.put("/update-user", async (req, res) => {
      const usersInfo = req.body;
      const email = usersInfo.email;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          name: usersInfo.name,
          address: usersInfo.address,
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
    //Update reviewers info
    app.put("/update-reviewers-info", async (req, res) => {
      const reviewersInfo = req.body;
      const email = reviewersInfo.email;
      const filter = { reviewersEmail: email };
      const updateDoc = {
        $set: {
          reviewersName: reviewersInfo.name,
          reviewersPhoto: reviewersInfo.photoURL,
        },
      };
      const options = { upsert: false };
      const result = await reviewsCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    //Update shipping status
    app.put("/update-shipping-status", async (req, res) => {
      const shipping = req.body;
      const id = shipping.id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          shift: shipping.shift,
        },
      };
      const options = { upsert: false };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    //Get all reviews
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
    //Connection continue
  }
};
run().catch(console.dir);
// Server listning
app.listen(port, () => console.log("Server is running on", port));

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");


require("dotenv").config();

const port = process.env.PORT || 9000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.obg4i.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db("carparts");
        const partsCollection = db.collection("partsCollection");

        // API to Run Server 
        app.get("/", async (req, res) => {
            res.send("Server is Running");
        });
        
        //API to get all parts
        app.get("/parts", async (req, res) => {
            const parts = await partsCollection.find({}).toArray();
            res.send(parts);
        });

       

    } finally {
        // client.close(); 
    }
};

run().catch(console.dir);

app.listen(port, () => console.log(`Listening on port ${port}`));
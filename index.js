const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");


require("dotenv").config();

const port = process.env.PORT || 9000;
const app = express();

app.use(cors());
app.use(bodyParser.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbidden access" });
        }
        console.log("decoded", decoded);
        req.decoded = decoded;
        next();
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.obg4i.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const run = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db("carparts");
        const partsCollection = db.collection("partsCollection");
        const ordersCollection = db.collection("ordersCollection");
        const userCollection = db.collection("userCollection");
        const reviewsCollection = db.collection("reviewsCollection");
        const adminCollection = db.collection("adminCollection");
        const paymentCollection = db.collection("paymentCollection");

        // API to Run Server 
        app.get("/", async (req, res) => {
            res.send("Server is Running");
        });
        
        //API to get all parts
        app.get("/parts", async (req, res) => {
            const parts = await partsCollection.find({}).toArray();
            res.send(parts);
        });

        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const item = await partsCollection.findOne(query)
            res.send(item)
        })
       
        //Update a part
        app.patch("/parts/:id", verifyJWT, verifyAdmin, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.headers.email;
            if (decodedEmail) {
                const id = req.params.id
                const newParts = req.body
                const query = { _id: ObjectId(id) }
                const product = await partsCollection.findOne(query)
                //  console.log(product,'prd');
                const options = { upsert: true };
                const updateDoc = {
                    $set: newParts
                }
                const result = await partsCollection.updateOne(query, updateDoc, options)
                res.send(result);
            } else {
                res.send("Unauthorized access");
            }
        });

        //create user
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body
            console.log(user?.photoURL)
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {

                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options)
            const getToken = jwt.sign({ email: email }, process.env.TOKEN, { expiresIn: '1d' })
            res.send({ result, getToken })
        })

        ////API to get all orders
        app.get("/orders", async (req, res) => {
            const orders = await ordersCollection.find({}).toArray();
            res.send(orders);
        });

        app.put('/tools/:id', async (req, res) => {
            const id = req.params.id
            const updateProduct = req.body
            // console.log(updateProduct);
            const query = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    availableQuantity: updateProduct.newQuantity
                }
            }

            const result = await partsCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })


    } finally {
        // client.close(); 
    }
};

run().catch(console.dir);

app.listen(port, () => console.log(`Listening on port ${port}`));
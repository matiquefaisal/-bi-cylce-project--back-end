const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
const objectId = require('mongodb').ObjectId
require('dotenv').config();
const port = process.env.PORT || 5000

// DB_USER=bicycleDB
// DB_PASS=bicycleDB321


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wanl6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("bicycle");
        const bicycleProductsCollection = database.collection("products");
        const bicycleUsersCollection = database.collection("users");
        const bicycleOrdersCollection = database.collection("orders");
        const bicycleReviewsCollection = database.collection("reviews");

        // ADD USERS 
        app.post('/addUser', async (req, res) => {
            const user = req.body
            const result = await bicycleUsersCollection.insertOne(user)
            res.json(result)
            console.log(result);
        })


        // ADD PRODUCT
        app.post('/dashboard/addProduct', async (req, res) => {
            const productDetail = req.body
            // console.log('hitting add product', req.body);
            const result = await bicycleProductsCollection.insertOne(productDetail)
            res.json(result)

        })

        // MAKE ADMIN
        app.put('/dashboard/makeAdmin', async (req, res) => {
            const email = req.body
            const adminEmail = email.email


            const filter = { email: adminEmail };

            const updateDoc = {
                $set: {
                    roll: 'admin'
                },
            };
            const result = await bicycleUsersCollection.updateOne(filter, updateDoc);
            res.json(result)
            console.log('database', result);

        })

        // ADMIN CHECK
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const adminEmail = { email: email }
            // console.log(adminEmail);
            const user = await bicycleUsersCollection.findOne(adminEmail);
            // console.log(user);
            let isAdmin = false;
            if (user?.roll === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })
        // USER CHECK
        app.get('/users/', async (req, res) => {


            // console.log(adminEmail);
            const user = bicycleUsersCollection.find({});
            const result = await user.toArray()
            res.json(result)
        })


        // DISPLAY PRODUCTS
        app.get('/products', async (req, res) => {

            const cursor = bicycleProductsCollection.find({});
            const result = await cursor.toArray()
            res.json(result)

        })
        // DISPLAY REVIEWS
        app.get('/reviews', async (req, res) => {

            const cursor = bicycleReviewsCollection.find({});
            const result = await cursor.toArray()
            res.json(result)

        })

        // ADD ORDERS
        app.post('/dashboard/orders', async (req, res) => {
            const productDetail = req.body
            const result = await bicycleOrdersCollection.insertOne(productDetail)
            res.json(result)
        })
        // DISPLAY ORDERS
        app.get('/dashboard/orders', async (req, res) => {
            const order = req.query
            const cursor = bicycleOrdersCollection.find(order);
            const result = await cursor.toArray()
            res.json(result)

        })

        // UPDATE STATUS
        app.put('/dashboard/orders/:id', async (req, res) => {
            const id = req.params.id
            const updateStatus = req.body

            const filter = { _id: objectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateStatus.status
                },
            };
            const result = await bicycleOrdersCollection.updateOne(filter, updateDoc, options);
            res.json(result)

        })

        // DELETE ORDER
        app.delete('/dashboard/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: objectId(id) }
            const result = await bicycleOrdersCollection.deleteOne(query)
            res.json(result)

        })
        // DELETE PRODUCT
        app.delete('/dashboard/product/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: objectId(id) }
            const result = await bicycleProductsCollection.deleteOne(query)
            res.json(result)
            console.log(result);
        })

        // ADD ADMIN
        app.put('/dashboard/makeAdmin', async (req, res) => {
            const email = req.body

            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    roll: 'admin'
                },
            };
            const result = await bicycleOrdersCollection.updateOne(filter, updateDoc, options);
            res.json(result)

        })

        // ADD REVIEW
        app.post('/dashboard/reviews', async (req, res) => {
            const reviewDetail = req.body
            console.log('hitting review product', req.body);
            const result = await bicycleReviewsCollection.insertOne(reviewDetail)
            console.log(result);
            res.json(result)
        })

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);



// MIDDLEWARE
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
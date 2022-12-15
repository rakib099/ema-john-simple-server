const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.i9w8jvi.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const productCollection = client.db('emaJohn').collection('products');

        // sending all products and productCount
        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            console.log(page, size);
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.skip(page * size).limit(size).toArray();
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count, products });
        });

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        });

        // load product by ids using post method
        app.post('/productsByIds', async (req, res) => {
            const ids = req.body;
            const ObjectIds = ids.map(id => ObjectId(id));
            const query = { _id: { $in: ObjectIds } };
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('ema-john server is running');
});

app.listen(port, () => {
    console.log(`ema-john server running on port ${port}`);
});
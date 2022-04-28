const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		res.status(401).send({ message: "Unauthorized Access!" });
	}
	const token = authHeader.split(" ")[1];

	jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
		if (err) {
			return res.status(403).send({ message: "Forbidden Access" });
		}
		console.log("decoded", decoded);
		req.decoded = decoded;
		next();
	});
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lry7n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});
async function run() {
	try {
		await client.connect();
		const serviceCollection = client
			.db("hotelFirebase")
			.collection("services");

		const orderCollection = client.db("hotelFirebase").collection("orders");

		//require('crypto').randomBytes(64).toString('hex')
		//AUTH
		app.post("/login", async (req, res) => {
			const user = req.body;
			const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
				expiresIn: "1d",
			});
			res.send({ accessToken });
		});

		//SERVICE
		//post method (add servicess)
		app.post("/service", async (req, res) => {
			const service = req.body;
			const result = await serviceCollection.insertOne(service);
			res.send({ success: true, message: "Service Add Success" });
		});

		//post method (order place)
		app.post("/order", async (req, res) => {
			const orderRoom = req.body;
			const result = await orderCollection.insertOne(orderRoom);
			res.send({ success: true, message: "Order Place Success" });
		});

		//get method (order list get)
		app.get("/orderList", verifyJWT, async (req, res) => {
			const decodedEmail = req.decoded.email;
			const email = req.query.email;
			if (email === decodedEmail) {
				const query = { email };
				const cursor = orderCollection.find(query);
				const orders = await cursor.toArray();
				res.send(orders);
			} else {
				res.status(403).send({ message: "Forbidden Access" });
			}
		});

		//get method (get service)
		app.get("/service", async (req, res) => {
			const query = {};
			const cursor = serviceCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});

		//get method (get service by limit and page set)
		app.get("/servicelist", async (req, res) => {
			const page = parseInt(req.query.page);
			const limit = parseInt(req.query.limit);
			console.log(page, limit);

			const query = {};
			const cursor = serviceCollection.find(query);
			const result = await cursor
				.skip(page * limit)
				.limit(limit)
				.toArray();

			res.send(result);
		});

		//get method (product count)
		app.get("/serviceListCount", async (req, res) => {
			const count = await serviceCollection.estimatedDocumentCount();
			res.send({ count });
		});

		//delete method (delete service)
		app.delete("/service/:id", async (req, res) => {
			const id = req.params.id;
			console.log(id);
			const query = { _id: ObjectId(id) };
			const result = await serviceCollection.deleteOne(query);
			res.send({ success: true, message: "Service delete success" });
		});
	} finally {
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Hotel Auth Firebase Servier is Runngi");
});

app.listen(port, () => {
	console.log("This server running port is: " + port);
});

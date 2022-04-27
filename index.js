const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

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

		//post method (add servicess)
		app.post("/service", async (req, res) => {
			const service = req.body;
			const result = await serviceCollection.insertOne(service);
			res.send({ success: true, message: "Service Add Success" });
		});

		//get method (get service)
		app.get("/service", async (req, res) => {
			const query = {};
			const cursor = serviceCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
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

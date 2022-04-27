const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
	res.send("Hotel Auth Firebase Servier is Runngi");
});

app.listen(port, () => {
	console.log("This server running port is: " + port);
});

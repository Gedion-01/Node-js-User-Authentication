const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const PORT = 4000;

app.use(express.json());

const posts = [
	{
		username: "Roach",
		title: "post1",
	},
	{
		username: "Nikolai",
		title: "post2",
	},
	{
		username: "Ghost",
		title: "post3",
	},
];

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];

	if (!authHeader) {
		return res
			.status(401)
			.json({ error: "Authorization header is missing." });
	}
	// spliting the auth header
	const token = authHeader.split(" ")[1];
	if (!token) return res.status(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({ error: "Invalid or expired token." });
		}
		req.user = user;
		next();
	});
};

app.get("/posts", authenticateToken, (req, res) => {
	res.json(posts.filter((post) => post.username === req.user.username));
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

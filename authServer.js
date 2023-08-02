const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());

let refreshTokens = [];

app.post("/generatetoken", (req, res) => {
	const refreshToken = req.body.token;
	if (refreshToken == null) {
		return res.sendStatus(401);
	}
	// check if refresh token is not saved
	if (!refreshTokens.includes(refreshToken)) {
		res.status(403).json({ msg: "can't generate token" });
	}
	// vertify the token with the saved refresh token
	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) {
			res.sendStatus(401);
		}
		const accessToken = generateToken({
			username: user.username,
			password: user.password,
		});
		// return new access token
		res.json({ accessToken: accessToken });
	});
});

// clearing our saved refresh token so that it can't be generated
app.delete("/logout", (req, res) => {
	refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
	res.status(400).json({ msg: "logout successfull" });
});

app.post("/login", async (req, res) => {
	// vertification for user todo

	const { username, password } = req.body;

	const user = users.find((user) => user.username === username);
	if (user == null) {
		return res.status(400).json({ msg: "can't find user" });
	}
	try {
		if (await bcrypt.compare(password, user.password)) {
			const accessToken = generateToken(user);
			const refreshToken = jwt.sign(
				user,
				process.env.REFRESH_TOKEN_SECRET
			);
			refreshTokens.push(refreshToken);
			res.json({ accessToken: accessToken, refreshToken: refreshToken });
		} else {
			res.status(403).json({ msg: "invalid user credential" });
		}
	} catch {
		res.status(201).json({ msg: "something went wrong" });
	}
});
app.post("/signup", async (req, res) => {
	const { username, password } = req.body;
	try {
		const salt = await bcrypt.genSalt();
		const hashedpassword = await bcrypt.hash(password, salt);
		// todo user vertification

		const user = { username: username, password: hashedpassword };
		users.push(user);
		console.log(users);
		res.json({ msg: "Account created successfully." });
	} catch {
		res.status(201).json({ msg: "Something went wrong" });
	}
});
const generateToken = (user) => {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: 60,
	});
};
users = [];
console.log(users);

app.listen(5000, () => {
	console.log("server running on port 5000");
});

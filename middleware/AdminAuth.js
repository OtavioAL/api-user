const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = function (req, res, next) {
  const authToken = req.headers["authorization"];

  try {
    if (!authToken) return res.status(403).json({ error: "forbidden" });

    const bearer = authToken.split(" ");
    const token = bearer[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("decoded", decoded);

    if (decoded.role === 1) next();
    else res.status(403).json({ error: "forbidden" });
  } catch (error) {
    return res.status(403).json({ error: "forbidden" });
  }
};

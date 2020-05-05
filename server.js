const express = require("express");
const server = express();

// Middleware
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth/auth-router");

server.use(helmet());
server.use(express.json());
server.use(cookieParser());
server.use(cors());

// Routes
server.use("/api", authRoute);

// Error middleware
server.use((err, req, res, next) => {
  console.log(err);
  if (err) {
    return res.status(500).json({
      message: "There was an error performing the required operation",
      validation: [],
      data: {},
    });
  }
});

server.get("/", (req, res) => {
  res.status(200).json({ message: "API up", validation: [], data: {} });
});

module.exports = server;
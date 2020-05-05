const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router({ mergeParams: true });

// Subroute for /users
const userRoute = require("./../users/user-router");
const restricted = require("./restricted-middleware");
router.use("/users", restricted(), userRoute);

// Db helper fns
const { findBy, insert } = require("./../users/user-model");

router.post("/register", async (req, res) => {
  try {
    const user = req.body;
    const hash = bcrypt.hashSync(req.body.password, Number(process.env.HASHES));
    user.password = hash;
    const newUser = await insert(user);
    res.status(200).json({
      message: `Registered ${newUser.username} successfully`,
      validation: [],
      data: newUser,
    });
  } catch (err) {
    errDetail(res, err);
  }
});

router.post("/login", validateUsername, async (req, res) => {
  const authError = {
    message: "Invalid Credentials",
    validation: [],
    data: {},
  };

  try {
    const { username, password } = req.body;
    const user = await findBy({ username });

    if (!user) {
      return res.status(401).json(authError);
    }

    // Auth in
    const authenticated = bcrypt.compareSync(password, user.password);
    if (!authenticated) {
      res.status(401).json(authError);
    }
    delete user.password; // This is no longer needed
    
    // Create the JWT token
    const payload = {
      userId: user.id,
      userRole: user.role_id
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    res.cookie("token", token);

    // Send the data back, including the token
    res.status(200).json({
      message: `Welcome, ${user.username}!`,
      validation: [],
      data: {
        user,
        token
      }
    });

  } catch (err) {
    errDetail(res, err);
  }
});

router.get("/logout", (req, res, next) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: "User has been logged out",
      validation: [],
      data: {},
    });
  }
  catch (err) {
    errDetail(res, err)
  }
});

/**
 * @function validateUsername: Validate the the id exists before submitting req
 * @param {*} req: The request object sent to the API
 * @param {*} res: The response object sent from the API
 * @param {*} next: The express middleware function to move to the next middleware
 * @returns: none
 */
async function validateUsername(req, res, next) {
  try {
    const { username } = req.body;
    const user = await findBy({ username });
    if (!user) {
      return res.status(404).json({
        message: "Not Found",
        validation: ["Username doesn't exist"],
        data: {},
      });
    }
    next();
  } catch (err) {
    errDetail(res, err);
  }
}

function errDetail(res, err) {
  console.log(err);
  return res.status(500).json({
    message: "There was a problem completing the required operation",
    validation: [],
    data: {},
  });
}

module.exports = router;
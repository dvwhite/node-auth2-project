const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Db helpers, utils
const { find, findBy } = require("./user-model");
const { sanitizeUser } = require("../../utils/utils");

router.get("/", decodeJWT, async (req, res) => {
  try {
    const decoded = req.token;
    console.log("decoded2:", decoded)
    const dept = decoded.userDepartment;
    const users = await find(dept);
    res.status(200).json({
      message: "Success",
      validation: [],
      data: users
    })
  } catch (err) {
    errDetail(res, err);
  }
});

router.get("/:id", validateUserId, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await findBy({ id });
    res.status(200).json({
      message: "Success",
      validation: [],
      data: sanitizeUser(user)
    })
  } catch (err) {
    errDetail(res, err);
  }
})

// Middleware
/**
 * @function validateUserId: Validate the the id exists before submitting req
 * @param {*} req: The request object sent to the API
 * @param {*} res: The response object sent from the API
 * @param {*} next: The express middleware function to move to the next middleware
 * @returns: none
 */
async function validateUserId(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = await findBy({ id });
    if (!user) {
      return res.status(404).json({
        message: "Not Found",
        validation: ["User id doesn't exist"],
        data: {},
      });
    }
    next();
  } catch (err) {
    errDetail(res, err);
  }
}

// Helpers
function errDetail(res, err) {
  console.log(err);
  return res.status(500).json({
    message: "There was a problem completing the required operation",
    validation: [],
    data: {},
  });
}

async function decodeJWT(req, res, next) {
  const { token } = req.cookies;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json(authError);
    } 
    console.log("decoded:", decoded)
    req.token = decoded;
    next();
  })
}
module.exports = router;
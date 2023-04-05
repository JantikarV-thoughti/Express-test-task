const express = require("express");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    res.status(201).send({ message: "User logged in successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/logout", async (req, res) => {
  try {
    res.status(200).send({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;

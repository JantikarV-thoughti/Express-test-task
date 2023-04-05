const express = require('express')
const router = express.Router()

router.get('/', async(req, res) => {
    try {
        res.status(200).send({ message: "Getting list of all posts" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})

router.get('/:id', async(req, res) => {
    try {
        res.status(200).send({ message: "Getting single post" });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})

router.post('/', async(req, res) => {
    try {
        res.status(201).send({ message: "Creating a new post." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})


router.put('/:id', async(req, res) => {
    try {
        res.status(200).send({ message: "Updating an existing post." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})



router.patch('/:id', async(req, res) => {
    try {
        res.status(200).send({ message: "Updating an existing post." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})



module.exports = router
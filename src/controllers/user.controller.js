const express = require('express')

const router = express.Router()

router.get('/', async(req,res) => {
    try {
        res.status(200).send({message: "Getting the list of all users"})
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})


router.get('/:id', async(req,res) => {
    try {
        res.status(200).send({message: "Getting the single user"})
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

router.post('/', async(req,res) => {
    try {
        res.status(201).send({message: "Created new user"})
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})


router.put('/:id', async(req,res) => {
    try {
        res.status(201).send({message: "Updated the existing user"})
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})


router.patch('/:id', async(req,res) => {
    try {
        res.status(200).send({message: "Updated the existing user"})
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})


router.delete('/:id', async(req,res) => {
    try {
        res.status(200).send({message: "Updated the existing user"})
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})


module.exports = router
const express = require('express')
const router = express.Router()
const User = require('../models/User');






//user creation 
//users/

router.post('/', async (req, res) =>{
    const {firstName, lastName, email, password} = req.body;

    try {
        const user = await User.create({
            firstName, 
            lastName,
            email,
            password,

        });console.log(user)
        await user.generateAuthToken();
        res.status(201).json(user);
    

    }catch(error){
        let msg;
        if(error.code == 11000){
            msg = 'Email already exists'
        } else {
            msg = error.message;
        }
        res.status(400).json(msg)
    }
})

//login user

router.post('/login', async(req, res) =>{
    const {email, password} = req.body;

    try{

        const user= await User.findByCredentials(email, password);
        await user.generateAuthToken();
        res.json(user)
    }catch (e){
        res.status(400).json(e.message)
    } 
})


module.exports = router;
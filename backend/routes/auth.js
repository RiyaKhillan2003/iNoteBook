const express = require('express');
const router = express.Router();
const User=require('../models/user');
const bcrypt=require('bcryptjs');
const { body, validationResult }= require('express-validator'); 
var jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRETKEY;
var fetchuser = require ('../middleware/fetchuser');

//Create a user using : POST "/api/auth/createuser". Doesnt require Auth
//Route1-->>
router.post('/createuser',[
    body('email',"Enter a valid email ").isEmail(),
    body('password').isLength({min:5})
],async (req,res)=> {
    let success=false;
    //if there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    
    //check whether the user with email exist already 
    try{

        let user = await User.findOne({email : req.body.email});
        if(user){
            return res.status(400).json({success,error : "Sorry a user with this email aready exist"})
        }
        const salt = await bcrypt.genSalt(10);
        const secPass =await bcrypt.hash( req.body.password,salt);

        //create a new user 
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email:req.body.email,
        });

        const data = {
            user:{
                id:user._id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success=true;
        res.json({success,authtoken});
    }
    catch(error){
        console.error(error.message);
        res.status(500).json(success,"Some Error Occuured");
    }
})

// Authenticate a user using: post "/api/auth/login". No login required
//Route2-->
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    //if there are errors , return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success,error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" })
        }

        const data = {
            user: {
                id: user._id
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


//Route3--> Get logged in user details : post: "/api/auth/getuser". Login required
router.post("/getuser",fetchuser,async(req,res) => {

try{
    var userId = req.user.id;
    const user=await User.findById(userId).select("-password");
    res.send(user);
}
catch(error){
    console.log(error.message);
    res.status(500).send("Internal Server Error");
}
})
module.exports = router;
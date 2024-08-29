const crud = require('../db/model');
const bcryptjs = require('bcryptjs');
const signUp = async(req, res) => {
    const {email, password, name} = req.body;

    try{
        if(!email ||!password || !name){
            res.status(400).json({success: "false" ,msg : "please enter all the fields"})
        }
        const alreadyExists = await crud.findOne({email : email});
        if(alreadyExists){
            res.status(400).json({success:"false", msg: "user already exists"});
        }
        const hashedPassword = await bcryptjs.hash(password, 10);

        const newUser = await crud.create({
            email,
            password: hashedPassword,
            name, 
        })
        await newUser.save();

        return res.status(201).json({success: "true", newUser: {
            ...newUser._doc,
            password: undefined,
        },})
        
    }catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

module.exports = signUp;
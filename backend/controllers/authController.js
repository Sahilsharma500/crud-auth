const crud = require('../db/model');
const bcryptjs = require('bcryptjs');
const generateTokenAndSetCookie = require('../utils/auth');
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
        const verificationToken = Math.floor(100000 + Math.random()*900000).toString();

        const newUser = await crud.create({
            email,
            password: hashedPassword,
            name, 
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24*60*60*1000
        })
        

        generateTokenAndSetCookie(res, newUser._id);

        return res.status(201).json({success: "true", newUser: {
            ...newUser._doc,
            password: undefined,
        },})
        
    }catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

const signIn = async (req, res) => {
    const {email, password} = req.body;

    try{
        if(!email || !password){
            return res.status(400).json({success: "false", msg: "please enter all the fields"});
        }
        const alreadyUser = await crud.findOne({email : email});

        if(!alreadyUser){
            return res.status(400).json({success: "false", msg: "User does not exist"})
        }
        const isPasswordvalidation = await bcryptjs.compare(password, alreadyUser.password );
        if(!isPasswordvalidation){
            return res.status(400).json({success:"false", msg: "Enter correct password"});
        }
        generateTokenAndSetCookie(res, alreadyUser._id);
        return res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				...alreadyUser._doc,
				password: undefined,
			},
		});
        
    }catch(error){
        return res.status(404).json({status: false, msg: error.message})
    }

};

module.exports = {
    signUp,
    signIn
};
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import nodemailer from 'nodemailer';
import OTP from '../models/otp.js';
dotenv.config();

export function createUser(req, res) {

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role
    })

    user.save().then(
        () => {
            res.json({
                message: "User create successfully"
            })
        }).catch(
            () => {
                res.json({
                    message: "User create failed"
                })
            })


}

export function loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password

    User.findOne({ email: email }).then(
        (user) => {
            if (user == null){
                res.status(404).json({
                    message:"User not found"
                })
            }else{
                const isPasswordCorrect = bcrypt.compareSync(password, user.password);

                if (isPasswordCorrect){
                    const token = jwt.sign(
                        {
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            role: user.role,
                            img: user.img
                        },
                        process.env.JWT_KEY
                    )
                    

                    res.json({
                        message: "User login successfully",
                        token: token,
                        role: user.role
                    })
                } else {
                    res.status(401).json({
                        message: "Invalid password"
                    })
                }
            }
        })
}

export async function loginWithGoogle(req,res){
    const token = req.body.accessToken;
    if(token==null){
        res.status(400).json({
            message:"Access token is required"
        })
        return
    }


 const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        
            headers: {
                Authorization: `Bearer ${token}`
            }
        
    })


    
    console.log(response.data);

    const user = await User.findOne({
         email: response.data.email 
        });

        /*
        email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: "customer"
    },
    isBlocked: {
        type: Boolean,
        required: true,
        default: false
    },
    img: {
        type: String,
        required: true,
        default: "https://static.vecteezy.com/system/resources/previews/027/448/973/large_2x/avatar-account-icon-default-social-media-profile-photo-vector.jpg"
    }
        */
        
        if(user==null){
                const newUser = new User(
                    {
                    email: response.data.email,
                    firstName: response.data.given_name,
                    lastName: response.data.family_name,
                    password: "googleUser",
                    img: response.data.picture
                }
                )
                await newUser.save();
                const token = jwt.sign(
                    {
                        email: newUser.email,
                        firstName: newUser.firstName,
                        lastName: newUser.lastName,
                        role: newUser.role,
                        img: newUser.img

                    },
                    process.env.JWT_KEY
                )
                res.json({
                    message: "User created successfully",
                    token: token,
                    role: newUser.role
                })
                    
                
            
        }else{
            const token = jwt.sign(
                {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    img: user.img
                },
                process.env.JWT_KEY
            )
            res.json({
                message: "User login successfully",
                token: token,
                role: user.role
            })

        }
}

const transport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "sahirusandeepa52@gmail.com",
        pass: "quofduvnugllgimo"
    },
    tls: {
        rejectUnauthorized: false
    }
})

export async function sendOTP(req, res) {
    
    const randomOTP = Math.floor(100000 + Math.random() * 900000);
    const email = req.body.email;
    if (email == null) {
        res.status(400).json({
            message: "Email is required"
        })
        return;
    }
    const user = await User.findOne({
        email: email
    })
    if( user == null) {
        res.status(404).json({
            message: "User not found"
        })
        
    }

    //delete existing OTP if any

    await OTP.deleteMany(
        { 
            email: email
         }
    );

    const message={
        from: "sahirusandeepa52@gmail.com",
        to: email,
        subject: "Resetting password for crystal beauty clear",
        text: "This is your password reset OTP: " + randomOTP
    }

    const otp = new OTP({
        email: email,
        otp: randomOTP
    })

    await otp.save()



    transport.sendMail(message, (error, info) => {
        if (error) {
            console.error(error)
            res.status(500).json({
                message: "Failed to send OTP",
                error: error
            });
        } else {
            res.json({
                message: "OTP sent successfully",
                otp: randomOTP
            });
        }
    })


}

export async function resetPassword(req,res){
    const otp = req.body.otp
    const email = req.body.email
    const newPassword = req.body.newPassword

    const response = OTP.findOne({
        email: email,
    })
    if(response == null){
        res.status(500).json({
            message: "No OTP request found. Please try again"
        })

    }
    if(otp == response.otp){
        await OTP.deleteMany(
            { 
                email: email
             }
        );
    

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        const response2 = await User.updateOne(
            {email: email},
            {password: hashedPassword}

        )
        res.json({
            message: "Password has been reset successfully"
        })
    


    }
        else{
            res.status(403).json({
                message: "OTP is incorrect. Please try again"
            })

        }
    }

    export function getUser(req,res){
        if(req.user == null){
            res.status(403).json({
                message: "Please login and try again"
            })
            return
        }else{
            res.json({
                ...req.user
            })
        }
    }




export function isAdmin(req){
    if(req.user == null){
        return false;
    }
        if(req.user.role != "admin"){
            return false;
        }
        return true;    
    }

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import jwt from 'jsonwebtoken';
import orderRouter from './routes/orderRoutes.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();



app.use(cors()) 
app.use(bodyParser.json());


app.use(
    (req,res,next) => {
        const tokenString = req.header('Authorization');
        if(tokenString != null){
            const token = tokenString.replace("Bearer ", "");
            //console.log(token);

            jwt.verify(token, process.env.JWT_KEY,
                (err,decoded) => {
                    if(decoded != null){
                        req.user = decoded;
                        next();
                    }else{
                        console.log("Invalid token");
                        res.status(403).json({
                            message: "Invalid token"
                        })
                    }
                    })


        }else{
            next();
        }
        
    
    }
    
)

mongoose.connect(process.env.MONGODB_URL).then(

    () => {
        console.log("Connected to the Database");
    }).catch(
        () => {
            console.log("Database connection failed");
        })


app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);







app.listen(5000, () => {
    console.log('Server started on port 5000');
});


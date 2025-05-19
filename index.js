import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import jwt from 'jsonwebtoken';
import orderRouter from './routes/orderRoutes.js';



const app = express();
app.use(bodyParser.json());

app.use(
    (req,res,next) => {
        const tokenString = req.header('Authorization');
        if(tokenString != null){
            const token = tokenString.replace("Bearer ", "");
            //console.log(token);

            jwt.verify(token, "cbc-batch-five#@2025",
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

mongoose.connect("mongodb+srv://SahiruSandeepa:8319@cluster0.kkkwtbq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(

    () => {
        console.log("Connected to the Database");
    }).catch(
        () => {
            console.log("Database connection failed");
        })


app.use("/products", productRouter);
app.use("/users", userRouter);
app.use("/orders", orderRouter);





//mongodb+srv://<SahiruSandeepa>:<8319>@cluster0.kkkwtbq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

app.listen(5000, () => {
    console.log('Server started on port 5000');
});


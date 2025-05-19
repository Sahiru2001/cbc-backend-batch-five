import Product from '../models/product.js';
import { isAdmin } from './userController.js';

export async function getProduct(req, res) {

    try{
        if(isAdmin(req)){
            const products = await Product.find();
            res.json(products);
        }else{
            const products = await Product.find({isAvailable: true});
            res.json(products);
        }
        }catch(err){
            res.json({
                message: "Failed to get products",
                error: err
            })
        }
    }

export function saveProduct(req, res) {
  if(!isAdmin(req)){
        res.status(403).json({
            message: "You are not authorized to add products"
        })
        return;
    }

    const product = new Product(req.body);
    
product
    .save()
    .then(() => {
      res.json({
        message: "Product added successfully",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Product adding failed",
        error: err.message, // Include the error message
      });
    });
}



export async function deleteProduct(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message: "You are not authorized to delete products"
        })
        return;

    }
    try{
        await Product.deleteOne({productId: req.params.productId}); 
        res.json({
            message: "Product deleted successfully"
        })
    }catch(err){
        res.json(500).json({
            message: "Product deleting failed",
            error: err
        })
    }  
}

export async function updateProduct(req,res){
    if(!isAdmin(req)){
        req.status(403).json({
            message:"You are not authorized to update a product"
        })
        return
    }

const productId = req.params.productId
const updatingData = req.body

try{
    await Product.updateOne(
        {productId : productId},
        updatingData
    )

    res.json(
        {
            message : "Product updated succesfully"
        }
    )

}catch(err){
    res.status(500).json({
         message: "internal server error",
         error: err   
    })
}

}

export async function getProductById(req,res){
    const productId = req.params.productId

    try{
        const product = await Product.findOne(
            {productId : productId }
        )
        if(product == null){
            res.status(404).json({
                message : "Product not found"
            })
            return;
        }
        if(product.isAvailable){
            res.json(product)
        }else{
            if(!isAdmin(req)){
                res.status(404).json({
                    message : "Product not found"

                })
                return
            }else{
                res.json(product)
            }
        }
        }
    
    catch(err){
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }

}


        






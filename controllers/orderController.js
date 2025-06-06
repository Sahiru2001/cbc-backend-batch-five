import Order from "../models/order.js";
import Product from "../models/product.js";
export async function createOrder(req, res) {
    //get user information
    //add current users name if not provided
    //orderId generate
    //create order object

    if(req.user == null) {
        res.status(403).json({
            message : "Please login to place an order"
        });
        return;
    }

    const orderInfo = req.body

    if(orderInfo.name == null) {
        orderInfo.name = req.user.firstName + " " + req.user.lastName;
    }

    //CBC00001
    let orderId = "CBC00001"

    const lastOrder = await Order.find().sort({date : -1}).limit(1);
    //[]
    if(lastOrder.length > 0) {
        const lastOrderId = lastOrder[0].orderId; //"CBC00551"

        const lastOrderNumberString = lastOrderId.replace("CBC","");//"00551"
        const lastOrderNumber = parseInt(lastOrderNumberString); //551
        const newOrderNumber = lastOrderNumber + 1; //552
        const newOrderNumberString = String(newOrderNumber).padStart(5,"0"); //00552
        orderId = "CBC" + newOrderNumberString; //CBC00552
    }



try{
    let total = 0;
    let labledTotal = 0;
    const products = []

    for(let i = 0; i < orderInfo.products.length; i++) {
        const item = await Product.findOne({productId : orderInfo.products[i].productId});
        if(item == null){
            res.status(404).json({
                message : "Product with productId" + orderInfo.products[i].productId + " not found",
            })
            return
        }
    
        
    if(item.isAvailable == false){
            res.status(404).json({
                message : "Product with productId " + orderInfo.products[i].productId + "Not available right now",
            })
            return
        }
        products[i] = {
            productInfo :{

                productId : item.productId,
                name : item.name,
                altNames : item.altNames,
                description : item.description,
                images : item.images,
                labledPrice : item.labledPrice,
                price : item.price,
            
        },
        quantity : orderInfo.products[i].quantity
    }
    total += (item.price * orderInfo.products[i].qty);
    labledTotal += (item.labledPrice * orderInfo.products[i].qty);
  
}

    const order = new Order({
    orderId : orderId,
    email : req.user.email,
    name : orderInfo.name,
    address : orderInfo.address,
    total : 0,
    phone : orderInfo.phone,
    products : []
})


    const createOrder = await order.save();
    res.json({
        message : "Order created successfully",
        order : createOrder
    })

}catch(err){
    res.status(500).json({
        message : "Failed to create order",
        error : err
    })
 }
}








    


    

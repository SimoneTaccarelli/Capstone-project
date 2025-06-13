import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({

    sessionID:{
        type: String,
        required: true,
        index: true,
    },
    items: [{
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        totalPrice:{
            type: Number,
            required: true,
            min: 0
        }
    }],

})

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;



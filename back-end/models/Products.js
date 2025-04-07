import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    imageUrl: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    }],
    category: {
        type: String,
        required: true,
    },
    });

const Product = mongoose.model("Product", productSchema);
export default Product;
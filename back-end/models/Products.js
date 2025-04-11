import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String,
    required: true 
},

  description: { 
    type: String 
},

  price: { type: Number, 
    required: true 
},

  imageUrl: [{ 
    type: String 
}], // ✅ Corretto: array di stringhe
  category: { 
    type: String 
},
  stock: { 
    type: Number, default: 0 
}
});

const Product = mongoose.model("Product", productSchema);
export default Product;
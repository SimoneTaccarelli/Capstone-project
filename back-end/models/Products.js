import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true 
  },
  imageUrl: [{ 
    type: String 
  }],
  category: { 
    type: String 
  }, // es: "Anime", "Manga"
  
  type: {
    type: String,
    enum: ["T-shirt", "Hoodie"],
    required: true,
  },
  graphic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Graphic",
    required: true,
  },
  
});

const Product = mongoose.model("Product", productSchema);
export default Product;

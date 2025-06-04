import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { 
    type: mongoose.Schema.Types.String,
    ref: "Graphic",
    required: true 
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true 
  },
  imageUrl: {
    type: [String]
  },
  category: { 
    type: String 
  }, // es: "Anime", "Manga"
  
  type: {
    type: String,
    enum: ["T-shirt", "Hoodie"],
    required: true,
  },
  color: {
    type: [String], // Cambiato da String a [String] per supportare più colori
    enum: ["Black", "Water Blue", "Beige", "Light Gray", "Light Purple", "Orange", "Rose Red", "Red", "Light Blue", "Light Brown", "Blue Jeans", "Dark Blue", "Purple Haze", "Dark Green", "Gray Green", "Pirate Gray"],
    required: true,
  },
  size: {
    type: [String], // Cambiato da String a [String] per supportare più taglie
    enum: ["S", "M", "L", "XL", "XXL"],
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

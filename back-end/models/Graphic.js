import mongoose from "mongoose";

const graphicSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    tags: [String], // ad esempio "One Piece", "Naruto"
    imageUrl: {
        type: [String]
     }, // immagine della grafica
});

const Graphic = mongoose.model("Graphic", graphicSchema);
export default Graphic;

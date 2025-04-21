import mongoose from "mongoose";

const settingsDesignSchema = new mongoose.Schema({
  logo: { type: String },
  frontImage: { type: String },

 
});

const SettingsDesign = mongoose.model("SettingsDesign", settingsDesignSchema);
export default SettingsDesign;
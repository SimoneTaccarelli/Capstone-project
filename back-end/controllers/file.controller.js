import { cloudinary } from '../utilities/cloudinary.js';
import SettingsDesign from '../models/SettingsDesign.js';

/**
 * Recupera tutte le immagini da Cloudinary
 */
export const getAllFiles = async (req, res) => {
  try {
    const { resources } = await cloudinary.search
      .expression('folder:itoko')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    const files = resources.map(file => ({
      id: file.public_id,
      name: file.filename || file.public_id.split('/').pop(),
      url: file.secure_url,
      size: file.bytes,
      type: 'file',
      format: file.format,
      createdAt: file.created_at
    }));

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Impossibile recuperare le immagini'
    });
  }
};

/**
 * Carica un'immagine su Cloudinary
 * Funzione generica utilizzabile per qualsiasi tipo di file
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nessun file caricato'
      });
    }

    res.status(200).json({
      success: true,
      url: req.file.secure_url,
      data: {
        name: req.file.originalname,
        url: req.file.secure_url,
        id: req.file.public_id,
        createdAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Impossibile caricare il file'
    });
  }
};

/**
 * Elimina un'immagine da Cloudinary
 */
export const eliminateFile = async (req, res) => {
  try {
    const { id } = req.params;
    await cloudinary.uploader.destroy(id, { invalidate: true });

    res.status(200).json({
      success: true,
      message: 'File eliminato con successo'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Impossibile eliminare il file'
    });
  }
};

/**
 * Recupera le impostazioni di design
 */
export const getDesignSettings = async (req, res) => {
  try {
    const settings = await SettingsDesign.findOne();
    
    if (!settings) {
      return res.status(200).json({
        success: true,
        data: { logo: null, frontImage: null },
        message: 'Nessuna impostazione di design trovata'
      });
    }
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Carica il file del logo
 */
export const uploadLogoFile = async (req, res) => {
  try {
    const fileUrl = req.file ? (req.file.path || req.file.secure_url || req.file.url) : null;
    
    if (!fileUrl) {
      return res.status(400).json({ success: false, error: 'Nessun file caricato' });
    }
    
    let settings = await SettingsDesign.findOne();
    if (!settings) {
      settings = new SettingsDesign();
    }
    
    settings.logo = fileUrl;
    await settings.save();
    
    res.status(200).json({ 
      success: true, 
      data: settings,
      message: 'Logo aggiornato con successo' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Carica il file dell'immagine frontale
 */
export const uploadFrontImageFile = async (req, res) => {
  try {
    const fileUrl = req.file ? (req.file.path || req.file.secure_url || req.file.url) : null;
    
    if (!fileUrl) {
      return res.status(400).json({ success: false, error: 'Nessun file caricato' });
    }
    
    let settings = await SettingsDesign.findOne();
    if (!settings) {
      settings = new SettingsDesign();
    }
    
    settings.frontImage = fileUrl;
    await settings.save();
    
    res.status(200).json({ 
      success: true, 
      data: settings,
      message: 'Immagine frontale aggiornata con successo' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};





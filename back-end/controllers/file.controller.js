import { cloudinary } from '../utilities/cloudinary.js';

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
    console.error('Errore nel recupero delle immagini:', error);
    res.status(500).json({ 
      success: false,
      error: 'Impossibile recuperare le immagini'
    });
  }
};

/**
 * Recupera immagini da una sottocartella specifica
 */
export const getFilesByFolderId = async (req, res) => {
  try {
    const { fileId } = req.params;
    const folder = fileId.replace(':', '');
    
    // Costruisci il percorso completo
    let searchExpression;
    if (folder === 'product' || folder === 'avatar' || folder === 'design') {
      searchExpression = `folder:itoko/${folder}`;
    } else {
      // Gestisci casi speciali o errori
      return res.status(400).json({
        success: false,
        error: 'Cartella non valida'
      });
    }
    
    const { resources } = await cloudinary.search
      .expression(searchExpression)
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
    console.error('Errore nel recupero delle immagini:', error);
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
      data: {
        id: req.file.public_id,
        url: req.file.secure_url,
        name: req.file.originalname,
        size: req.file.bytes,
        format: req.file.format,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Errore nel caricamento del file:', error);
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
    console.error('Errore nell\'eliminazione del file:', error);
    res.status(500).json({
      success: false,
      error: 'Impossibile eliminare il file'
    });
  }
}





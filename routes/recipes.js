import express from 'express';
import { upload } from '../middleware/upload.js';
import { analyzeImage, generateRecipes } from '../services/claude.js';
import { imageToBase64, getMimeType, deleteFile } from '../utils/imageProcessor.js';

const router = express.Router();

/**
 * POST /api/analyze
 * Analyse une image et génère des recettes
 */
router.post('/analyze', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Aucune image fournie',
        message: 'Veuillez uploader une image',
      });
    }

    const imagePath = req.file.path;
    const mimeType = getMimeType(req.file.originalname);

    // Convertir l'image en base64
    const imageBase64 = await imageToBase64(imagePath);

    // Analyser l'image avec Claude Vision
    const ingredients = await analyzeImage(imageBase64, mimeType);

    // Parser les filtres depuis le body
    const filters = req.body.filters ? JSON.parse(req.body.filters) : {};

    // Générer les recettes
    const recipes = await generateRecipes(ingredients, filters);

    // Supprimer le fichier temporaire
    await deleteFile(imagePath);

    res.json({
      success: true,
      data: {
        ingredients,
        recipes,
      },
    });
  } catch (error) {
    // Supprimer le fichier en cas d'erreur
    if (req.file) {
      await deleteFile(req.file.path);
    }
    next(error);
  }
});

/**
 * POST /api/recipes/refine
 * Régénère des recettes avec des ingrédients spécifiques
 */
router.post('/recipes/refine', async (req, res, next) => {
  try {
    const { ingredients, filters } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        error: 'Ingrédients manquants',
        message: 'Veuillez fournir une liste d\'ingrédients',
      });
    }

    const recipes = await generateRecipes(ingredients, filters);

    res.json({
      success: true,
      data: {
        recipes,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/health
 * Vérifier l'état du serveur
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;

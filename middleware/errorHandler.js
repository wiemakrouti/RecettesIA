/**
 * Middleware de gestion des erreurs globales
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Erreur:', err);

  // Erreur Multer (upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Fichier trop volumineux',
        message: 'La taille maximale est de 5MB',
      });
    }
    return res.status(400).json({
      error: 'Erreur d\'upload',
      message: err.message,
    });
  }

  // Erreur de validation
  if (err.message.includes('Seules les images')) {
    return res.status(400).json({
      error: 'Format de fichier invalide',
      message: err.message,
    });
  }

  // Erreur API Claude
  if (err.message.includes('Impossible')) {
    return res.status(500).json({
      error: 'Erreur IA',
      message: err.message,
    });
  }

  // Erreur générique
  res.status(500).json({
    error: 'Erreur serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue',
  });
};

/**
 * Middleware pour les routes non trouvées
 */
export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.originalUrl} n'existe pas`,
  });
};

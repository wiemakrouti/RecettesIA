import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import recipesRouter from './routes/recipes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Configuration des variables d'environnement
dotenv.config();

// Créer __dirname pour les modules ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globaux
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🍳 Recipe AI API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      analyze: 'POST /api/analyze',
      refine: 'POST /api/recipes/refine',
    },
  });
});

app.use('/api', recipesRouter);

// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Vérifier que la clé API est configurée
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY n\'est pas configurée !');
    console.warn('   Créez un fichier .env basé sur .env.example');
  }
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu. Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT reçu. Arrêt du serveur...');
  process.exit(0);
});

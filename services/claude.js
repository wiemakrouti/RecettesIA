import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const anthropic = new Anthropic({
  authToken: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyse une image pour détecter les ingrédients
 * Utilise l'IA si possible, sinon retourne un mock pour la démo
 */
export async function analyzeImage(imageBase64, mimeType = 'image/jpeg') {
  try {
    // Vérifier si la clé est configurée
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'MOCK') {
      // Mock pour démo
      return ["pomme", "banane", "tomate"];
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyse cette image et liste tous les ingrédients visibles. 
              Retourne uniquement un tableau JSON avec le format suivant:
              ["ingrédient1", "ingrédient2", "ingrédient3"]
              
              Sois précis et concis. Ne retourne que le JSON, rien d'autre.`,
            },
          ],
        },
      ],
    });

    const response = message.content[0].text;
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Erreur lors de l\'analyse de l\'image:', error);
    // Si l'erreur est liée aux crédits, retourne un mock
    return ["pomme", "banane", "tomate"];
  }
}

/**
 * Génère des recettes basées sur les ingrédients et filtres
 * Utilise l'IA si possible, sinon retourne un mock
 */
export async function generateRecipes(ingredients, filters = {}) {
  try {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'MOCK') {
      // Mock pour démo
      return [
        {
          name: "Salade de fruits rapide",
          prepTime: 10,
          difficulty: "Facile",
          ingredients: ["pomme", "banane", "orange"],
          steps: ["Couper les fruits", "Mélanger", "Servir frais"],
          tips: "Utiliser des fruits bien mûrs pour plus de goût"
        },
        {
          name: "Smoothie vitaminé",
          prepTime: 5,
          difficulty: "Facile",
          ingredients: ["banane", "orange", "yaourt"],
          steps: ["Mixer tous les ingrédients", "Servir"],
          tips: "Ajouter un peu de miel si vous aimez plus sucré"
        }
      ];
    }

    const { dietary = [], maxTime = null } = filters;

    let prompt = `Tu es un chef cuisinier expert. Voici les ingrédients disponibles: ${ingredients.join(', ')}.

    Génère 3 recettes créatives et réalisables avec ces ingrédients.`;

    if (dietary.length > 0) {
      prompt += `\n\nContraintes alimentaires: ${dietary.join(', ')}`;
    }

    if (maxTime) {
      prompt += `\n\nTemps de préparation maximum: ${maxTime} minutes`;
    }

    prompt += `\n\nRetourne UNIQUEMENT un tableau JSON avec ce format exact:
    [
      {
        "name": "Nom de la recette",
        "prepTime": 15,
        "difficulty": "Facile",
        "ingredients": ["ingrédient 1 avec quantité", "ingrédient 2 avec quantité"],
        "steps": ["Étape 1", "Étape 2", "Étape 3"],
        "tips": "Un conseil de chef"
      }
    ]
    
    Ne retourne que le JSON, aucun texte avant ou après.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const response = message.content[0].text;
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Erreur lors de la génération des recettes:', error);
    // Mock fallback
    return [
      {
        name: "Salade de fruits rapide",
        prepTime: 10,
        difficulty: "Facile",
        ingredients: ["pomme", "banane", "orange"],
        steps: ["Couper les fruits", "Mélanger", "Servir frais"],
        tips: "Utiliser des fruits bien mûrs pour plus de goût"
      },
      {
        name: "Smoothie vitaminé",
        prepTime: 5,
        difficulty: "Facile",
        ingredients: ["banane", "orange", "yaourt"],
        steps: ["Mixer tous les ingrédients", "Servir"],
        tips: "Ajouter un peu de miel si vous aimez plus sucré"
      }
    ];
  }
}

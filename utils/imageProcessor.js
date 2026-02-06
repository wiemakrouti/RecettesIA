import fs from 'fs/promises';
import path from 'path';

/**
 * Convertit une image en base64
 */
export async function imageToBase64(imagePath) {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    throw new Error('Erreur lors de la lecture de l\'image');
  }
}

/**
 * Détermine le type MIME à partir de l'extension
 */
export function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'image/jpeg';
}

/**
 * Supprime un fichier uploadé
 */
export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
  }
}

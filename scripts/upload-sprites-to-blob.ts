import { put } from '@vercel/blob';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function uploadSpritesToBlob() {
  const spritesDir = join(process.cwd(), 'public', 'pokemon', 'sprites');
  
  try {
    const pokemonDirs = await readdir(spritesDir);
    
    for (const pokemonDir of pokemonDirs) {
      const pokemonPath = join(spritesDir, pokemonDir);
      const stats = await stat(pokemonPath);
      
      if (stats.isDirectory()) {
        const files = await readdir(pokemonPath);
        
        for (const file of files) {
          try {
            const filePath = join(pokemonPath, file);
            const fileContent = await readFile(filePath);
            
            const blobPath = `${pokemonDir}/${file}`;
            const blob = await put(blobPath, fileContent, {
              access: 'public',
            });
            
            console.log(`Uploaded ${blobPath} to ${blob.url}`);
          } catch (error) {
            console.error(`Error uploading ${file}:`, error);
          }
        }
      }
    }
    
    console.log('All sprites uploaded successfully!');
  } catch (error) {
    console.error('Error uploading sprites:', error);
  }
}

uploadSpritesToBlob();
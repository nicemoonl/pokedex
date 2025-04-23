/**
 * Script to upload sprites to Cloudinary.
 *
 * Usage:
 *   npx tsx scripts/uploadSpritesToCloudinary.ts
 *   npx tsx scripts/uploadSpritesToCloudinary.ts -f <folder>
 *
 * Options:
 *   -f, --folder <folder (pokemon id)>  Specific Pokemon folder to upload
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Source directory
const SPRITES_DIR = path.join(process.cwd(), 'public', 'pokemon', 'sprites');

async function uploadSpritesToCloudinary(targetFolder?: string) {
  try {
    // Check if sprites directory exists
    if (!fs.existsSync(SPRITES_DIR)) {
      console.error('Sprites directory not found!');
      return;
    }

    // Get Pokemon directories based on target folder
    const pokemonDirs = targetFolder
      ? [targetFolder]
      : fs.readdirSync(SPRITES_DIR);
    let totalFiles = 0;
    let uploadedFiles = 0;

    // Count total files
    for (const pokemonDir of pokemonDirs) {
      const dirPath = path.join(SPRITES_DIR, pokemonDir);
      if (fs.statSync(dirPath).isDirectory()) {
        const files = fs.readdirSync(dirPath);
        totalFiles += files.length;
      }
    }

    console.log(`Found ${totalFiles} files to upload`);

    // Upload files for each Pokemon
    for (const pokemonDir of pokemonDirs) {
      const dirPath = path.join(SPRITES_DIR, pokemonDir);
      if (!fs.statSync(dirPath).isDirectory()) continue;

      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const publicId = path.parse(file).name;
        const folder = `pokemon/sprites/${pokemonDir}`;

        try {
          await cloudinary.uploader.upload(filePath, {
            public_id: publicId,
            folder: folder,
            upload_preset: 'pokedex_upload_preset'
          });

          uploadedFiles++;
          const progress = ((uploadedFiles / totalFiles) * 100).toFixed(2);
          console.log(`[${progress}%] Uploaded ${publicId}`);
        } catch (error) {
          console.error(`Failed to upload ${publicId}:`, error);
        }
      }
    }

    console.log('Upload completed!');
    console.log(`Successfully uploaded ${uploadedFiles} out of ${totalFiles} files`);
  } catch (error) {
    console.error('Error during upload:', error);
  }
}

// Define the type for command line arguments
interface Arguments {
  folder?: string;
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('folder', {
    alias: 'f',
    description: 'Specific Pokemon folder to upload',
    type: 'string',
  })
  .help()
  .parseSync() as Arguments;

// Run the upload script
uploadSpritesToCloudinary(argv.folder);
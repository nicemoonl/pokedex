import { list } from '@vercel/blob';

const SPRITE_PREFIX = 'pokemon/sprites';
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

type SpriteType = {
  url: string;
  pathname: string;
};

let spriteCache: Record<string, SpriteType> = {};

export async function initializeSpriteCache() {
  try {
    const { blobs } = await list({ token: BLOB_READ_WRITE_TOKEN });
    spriteCache = blobs.reduce((acc, blob) => {
      acc[blob.pathname] = {
        url: blob.url,
        pathname: blob.pathname
      };
      return acc;
    }, {} as Record<string, SpriteType>);
  } catch (error) {
    console.error('Error initializing sprite cache:', error);
  }
}

export function getPokemonSpriteUrl(pokemonId: string | number, fileName: string): string {
  const pathname = `${pokemonId}/${fileName}`;
  return spriteCache[pathname]?.url || '';
}

export function getPokemonSpritePath(pokemonId: string | number, fileName: string): string {
  return `${SPRITE_PREFIX}/${pokemonId}/${fileName}`;
}
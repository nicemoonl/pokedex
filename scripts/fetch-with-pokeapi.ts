/**
 * Pokemon Data Fetching Script
 * 
 * This script fetches Pokemon-related data from the PokeAPI and updates the local database.
 * It can be used to fetch specific data types or all available data at once.
 * 
 * Available data types:
 * - generation:    Pokemon game generations
 * - versionGroup:  Version groups (e.g., Red/Blue, Gold/Silver)
 * - version:       Game versions
 * - pokedex:       Regional Pokedex data
 * - type:          Pokemon types (e.g., Fire, Water)
 * - ability:       Pokemon abilities
 * - species:       Pokemon species information
 * 
 * Usage:
 * 1. Fetch all data:
 *    npx tsx fetch-with-pokeapi.ts
 * 
 * 2. Fetch specific data type:
 *    npx tsx fetch-with-pokeapi.ts <dataType>
 * 
 * Example commands:
 *    npx tsx fetch-with-pokeapi.ts generation
 *    npx tsx fetch-with-pokeapi.ts type
 *    npx tsx fetch-with-pokeapi.ts species
 * 
 * Output:
 *    ✅ Fetch <dataType> completed
 *    All fetch functions completed successfully
 */

import { fetchGeneration, fetchVersionGroup, fetchVersion, fetchPokedex, fetchPokemonType, fetchPokemonAbility, fetchPokemonSpecies } from '../data/pokedb';

const fetchFunctions = {
  generation: fetchGeneration,
  versionGroup: fetchVersionGroup,
  version: fetchVersion,
  pokedex: fetchPokedex,
  type: fetchPokemonType,
  ability: fetchPokemonAbility,
  species: fetchPokemonSpecies
};

type FetchFunctionKey = keyof typeof fetchFunctions;

async function runFetchFunction(functionName: FetchFunctionKey) {
  try {
    const fetchFunction = fetchFunctions[functionName];
    await fetchFunction();
    console.log(`✅ Fetch ${functionName} completed`);
  } catch (error) {
    console.error(`Error running fetch function ${functionName}:`, error);
  }
}

async function runAllFetchFunctions() {
  try {
    for (const [name, func] of Object.entries(fetchFunctions)) {
      await func();
      console.log(`✅ Fetch ${name} completed`);
    }
    console.log('All fetch functions completed successfully');
  } catch (error) {
    console.error('Error running fetch functions:', error);
  }
}

const functionArg = process.argv[2] as FetchFunctionKey;

if (functionArg) {
  if (functionArg in fetchFunctions) {
    runFetchFunction(functionArg);
  } else {
    console.log('Available functions:', Object.keys(fetchFunctions).join(', '));
    console.log('Usage: npx tsx fetch-with-pokeapi.ts [functionName]');
  }
} else {
  runAllFetchFunctions();
}

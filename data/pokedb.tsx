'use server'
import { GameClient, PokemonClient } from 'pokenode-ts'; // import the GameClient
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const gameApi = new GameClient() // create a GameClient
const pokemonApi = new PokemonClient() // create a PokemonClient
const prisma = new PrismaClient() // create a PrismaClient

interface nameObj {
  language: {
    name: string
    url: string | undefined
  }
  name: string
}

const getNameByLanguage = (namesList: nameObj[], lang: string) => {
  if (lang == 'jp') {
    return namesList.find(nameObj => nameObj.language.name == 'ja-Hrkt')?.name
      || namesList.find(nameObj => nameObj.language.name == 'ja')?.name
      || ''
  } else if (lang == 'zh') {
    return namesList.find(nameObj => nameObj.language.name == 'zh-Hant')?.name
      || namesList.find(nameObj => nameObj.language.name == 'zh-Hans')?.name
      || ''
  } else {
    // default English
    return namesList.find(nameObj => nameObj.language.name == 'en')?.name || ''
  }
}

/* Dependency Level: 0 */
export const fetchGeneration = async () => {
  const database = prisma.gameGeneration

  // fetch data with API
  const apiData = await gameApi.listGenerations(0, 99)
  // console.log(apiData)
  const apiDataResults = apiData.results

  // update database
  for (const item of apiDataResults) {
    const generationDetail = await gameApi.getGenerationByName(item.name)
    await database.upsert({
      where: { generation_id: generationDetail.id },
      update: {
        name: generationDetail.name,
        main_region: generationDetail.main_region.name,
      },
      create: {
        generation_id: generationDetail.id,
        name: generationDetail.name,
        main_region: generationDetail.main_region.name,
      },
    })
  }
}

/* Dependency Level: 1 */
export const fetchVersionGroup = async () => {
  // dependencies: gameGeneration
  const database = prisma.gameVersionGroup

  // fetch data with API
  const apiData = await gameApi.listVersionGroups(0, 99)
  // console.log(apiData)
  const apiDataResults = apiData.results

  // update database
  for (const item of apiDataResults) {
    const versionGroupDetail = await gameApi.getVersionGroupByName(item.name)
    const generation = await prisma.gameGeneration.findUnique({
      where: {
        name: versionGroupDetail.generation.name,
      }
    })
    await database.upsert({
      where: { version_group_id: versionGroupDetail.id },
      update: {
        name: versionGroupDetail.name,
        order: versionGroupDetail.order,
        generation_id: generation?.generation_id,
      },
      create: {
        version_group_id: versionGroupDetail.id,
        name: versionGroupDetail.name,
        order: versionGroupDetail.order,
        generation_id: generation?.generation_id || -1,
      },
    })
  }
}

/* Dependency Level: 2 */
export const fetchVersion = async () => {
  // dependencies: gameGeneration
  const database = prisma.gameVersion

  // fetch data with API
  const apiData = await gameApi.listVersions(0, 99)
  // console.log(apiData)
  const apiDataResults = apiData.results

  // update database
  for (const item of apiDataResults) {
    const versionDetail = await gameApi.getVersionByName(item.name)
    const versionGroup = await prisma.gameVersionGroup.findUnique({
      where: {
        name: versionDetail.version_group.name,
      }
    })
    await database.upsert({
      where: { version_id: versionDetail.id },
      update: {
        name: versionDetail.name,
        name_jp: getNameByLanguage(versionDetail.names, 'jp'),
        name_zh: getNameByLanguage(versionDetail.names, 'zh'),
        version_group_id: versionGroup?.version_group_id,
      },
      create: {
        version_id: versionDetail.id,
        name: versionDetail.name,
        name_jp: getNameByLanguage(versionDetail.names, 'jp'),
        name_zh: getNameByLanguage(versionDetail.names, 'zh'),
        version_group_id: versionGroup?.version_group_id || -1,
      },
    })
  }
}

/* Dependency Level: 2 */
export const fetchPokedex = async () => {
  const database = prisma.pokedex

  // fetch data with API
  const apiData = await gameApi.listPokedexes(0, 99)
  // console.log(apiData)
  const apiDataResults = apiData.results

  // update database
  for (const item of apiDataResults) {
    const pokedexDetail = await gameApi.getPokedexByName(item.name)
    const versionGroupsConnection = pokedexDetail.version_groups.map(versionGroup => {
      return {
        name: versionGroup.name
      }
    })
    await database.upsert({
      where: { pokedex_id: pokedexDetail.id },
      update: {
        name: pokedexDetail.name,
        version_groups: {
          connect: versionGroupsConnection
        }
      },
      create: {
        pokedex_id: pokedexDetail.id,
        name: pokedexDetail.name,
        version_groups: {
          connect: versionGroupsConnection
        }
      },
    })
  }
}

export const getPokedex = async () => {
  const pokedexDB = prisma.pokedex
  const data = await pokedexDB.findMany({
    orderBy: [
      {
        pokedex_id: 'asc',
      },
    ],
  })
  return data.map(item => {
    return {
      id: item.pokedex_id,
      name: item.name,
    }
  })
}

export interface getPokemonsByGenerationType {
  name: string
  name_jp: string | null
  name_zh: string | null
  order: number
  pokedex_entries: {
    entry_number: number
  }[]
  pokemons: {
    pokemon_id: number
  }[]
}

export const getPokemonsByGeneration = async (generationId: string) => {
  const generationMap = [
    {
      generationId: '0',
      generationName: 'national',
    },
    {
      generationId: '1',
      generationName: 'generation-i',
    },
    {
      generationId: '2',
      generationName: 'generation-ii',
    },
    {
      generationId: '3',
      generationName: 'generation-iii',
    },
    {
      generationId: '4',
      generationName: 'generation-iv',
    },
    {
      generationId: '5',
      generationName: 'generation-v',
    },
    {
      generationId: '6',
      generationName: 'generation-vi',
    },
    {
      generationId: '7',
      generationName: 'generation-vii',
    },
    {
      generationId: '8',
      generationName: 'generation-viii',
    },
    {
      generationId: '9',
      generationName: 'generation-ix',
    },
  ]
  const generationName = generationMap.find(item => item.generationId == generationId)?.generationName || ''
  if (generationName) {
    if (generationName == 'national') {
      const entries = await prisma.pokemonSpecies.findMany({
        orderBy: {
          pokemon_species_id: 'asc',
        },
        select: {
          order: true,
          name: true,
          name_jp: true,
          name_zh: true,
          pokemons: {
            where: {
              is_default: true,
            },
            select: {
              pokemon_id: true,
              types: {
                select: {
                  name: true,
                }
              },
            }
          },
          pokedex_entries: {
            where: {
              pokedex_name: 'national',
            },
            select: {
              entry_number: true,
            }
          }
        },
      })
      return entries
    } else {
      const entries = await prisma.pokemonSpecies.findMany({
        where: {
          generation_name: generationName,
        },
        orderBy: {
          pokemon_species_id: 'asc',
        },
        select: {
          order: true,
          name: true,
          name_jp: true,
          name_zh: true,
          pokemons: {
            where: {
              is_default: true,
            },
            select: {
              pokemon_id: true,
              types: {
                select: {
                  name: true,
                }
              },
            }
          },
          pokedex_entries: {
            where: {
              pokedex_name: 'national',
            },
            select: {
              entry_number: true,
            }
          }
        },
      })
      return entries
    }
  } else {
    Promise.reject(new Error("Unable to find Pokedex"))
  }
}

/* Dependency Level: 3 */
export const fetchPokemonType = async () => {
  const database = prisma.pokemonType

  // fetch data with API
  const apiData = await pokemonApi.listTypes(0, 99)
  // console.log(apiData)
  const apiDataResults = apiData.results

  const typeList = []

  for (const item of apiDataResults) {
    const typeDetail = await pokemonApi.getTypeByName(item.name)
    typeList.push(typeDetail) // cache the list for later use for relation connection

    await database.upsert({
      where: { type_id: typeDetail.id },
      update: {
        name: typeDetail.name,
        name_jp: getNameByLanguage(typeDetail.names, 'jp'),
        name_zh: getNameByLanguage(typeDetail.names, 'zh'),
      },
      create: {
        type_id: typeDetail.id,
        name: typeDetail.name,
        name_jp: getNameByLanguage(typeDetail.names, 'jp'),
        name_zh: getNameByLanguage(typeDetail.names, 'zh'),
      }
    })
  }

  // connection relation
  for (const typeDetail of typeList) {
    await database.update({
      where: { type_id: typeDetail.id },
      data: {
        no_damage_to: {
          connect: typeDetail.damage_relations.no_damage_to.map(item => { return { name: item.name } })
        },
        half_damage_to: {
          connect: typeDetail.damage_relations.half_damage_to.map(item => { return { name: item.name } })
        },
        double_damage_to: {
          connect: typeDetail.damage_relations.double_damage_to.map(item => { return { name: item.name } })
        },
      },
    })
  }
}

/* Dependency Level: 3 */
export const fetchPokemonAbility = async () => {
  const database = prisma.pokemonAbility

  // fetch data with API
  const apiData = await pokemonApi.listAbilities(0, 9999)
  // console.log(apiData)
  const apiDataResults = apiData.results

  // update ability database
  for (const item of apiDataResults) {
    const pokemonAbilityDetail = await pokemonApi.getAbilityByName(item.name)

    await database.upsert({
      where: {
        ability_id: pokemonAbilityDetail.id
      },
      update: {
        name: pokemonAbilityDetail.name,
        name_jp: getNameByLanguage(pokemonAbilityDetail.names, 'jp'),
        name_zh: getNameByLanguage(pokemonAbilityDetail.names, 'zh'),
        effect: pokemonAbilityDetail.effect_entries.find(entry => entry.language.name == 'en')?.effect || '',
        short_effect: pokemonAbilityDetail.effect_entries.find(entry => entry.language.name == 'en')?.short_effect || '',
      },
      create: {
        ability_id: pokemonAbilityDetail.id,
        name: pokemonAbilityDetail.name,
        name_jp: getNameByLanguage(pokemonAbilityDetail.names, 'jp'),
        name_zh: getNameByLanguage(pokemonAbilityDetail.names, 'zh'),
        effect: pokemonAbilityDetail.effect_entries.find(entry => entry.language.name == 'en')?.effect || '',
        short_effect: pokemonAbilityDetail.effect_entries.find(entry => entry.language.name == 'en')?.short_effect || '',
      }
    })
  }
}

export const getPokemonAbilityByName = async (abilityName: string) => {
  const database = prisma.pokemonAbility

  const ability = await database.findUnique({
    where: {
      name: abilityName,
    },
  })

  return ability
}

/* Dependency Level: 4 */
// fetch pokemon species and corresponding pokemon detail
export const fetchPokemonSpecies = async () => {
  const database = prisma.pokemonSpecies

  // fetch data with API
  const apiData = await pokemonApi.listPokemonSpecies(0, 9999)
  // console.log(apiData)
  const apiDataResults = apiData.results

  const pokemonSpeciesList = []

  // update database
  for (const item of apiDataResults) {
    const pokemonSpeciesDetail = await pokemonApi.getPokemonSpeciesByName(item.name)
    pokemonSpeciesList.push(pokemonSpeciesDetail)

    // upsert PokemonSpecies entry
    await database.upsert({
      where: { pokemon_species_id: pokemonSpeciesDetail.id },
      update: {
        name: pokemonSpeciesDetail.name,
        name_jp: getNameByLanguage(pokemonSpeciesDetail.names, 'jp'),
        name_zh: getNameByLanguage(pokemonSpeciesDetail.names, 'zh'),
        order: pokemonSpeciesDetail.order,
        gender_rate: pokemonSpeciesDetail.gender_rate,
        capture_rate: pokemonSpeciesDetail.capture_rate,
        is_legendary: pokemonSpeciesDetail.is_legendary,
        is_mythical: pokemonSpeciesDetail.is_mythical,
        evolves_from_species_name: pokemonSpeciesDetail.evolves_from_species?.name || '',
        generation_name: pokemonSpeciesDetail.generation.name,
      },
      create: {
        pokemon_species_id: pokemonSpeciesDetail.id,
        name: pokemonSpeciesDetail.name,
        name_jp: getNameByLanguage(pokemonSpeciesDetail.names, 'jp'),
        name_zh: getNameByLanguage(pokemonSpeciesDetail.names, 'zh'),
        order: pokemonSpeciesDetail.order,
        gender_rate: pokemonSpeciesDetail.gender_rate,
        capture_rate: pokemonSpeciesDetail.capture_rate,
        is_legendary: pokemonSpeciesDetail.is_legendary,
        is_mythical: pokemonSpeciesDetail.is_mythical,
        evolves_from_species_name: pokemonSpeciesDetail.evolves_from_species?.name || '',
        generation_name: pokemonSpeciesDetail.generation.name,
      },
    })

    // upsert PokemonSpeciesDexEntry
    for (const pokedex_number of pokemonSpeciesDetail.pokedex_numbers) {
      await prisma.pokemonSpeciesDexEntry.upsert({
        where: {
          pokedex_name_entry_number: {
            pokedex_name: pokedex_number.pokedex.name,
            entry_number: pokedex_number.entry_number,
          }
        },
        update: {
          pokedex_name: pokedex_number.pokedex.name,
          entry_number: pokedex_number.entry_number,
          pokemon_species_name: pokemonSpeciesDetail.name,
        },
        create: {
          pokedex_name: pokedex_number.pokedex.name,
          entry_number: pokedex_number.entry_number,
          pokemon_species_name: pokemonSpeciesDetail.name,
        }
      })
    }
  }

  // upsert Pokemon
  for (const pokemonSpeciesDetail of pokemonSpeciesList) {
    for (const variation of pokemonSpeciesDetail.varieties) {
      await fetchPokemonByName(variation.pokemon.name)
    }
  }
}

// nested function in fetchPokemonSpecies()
const fetchPokemonByName = async (pokemonName: string) => {
  const database = prisma.pokemon

  // fetch data with API
  const pokemonDetail = await pokemonApi.getPokemonByName(pokemonName)

  // upsert a pokemon
  await database.upsert({
    where: {
      pokemon_id: pokemonDetail.id,
    },
    update: {
      name: pokemonDetail.name,
      weight: pokemonDetail.weight,
      types: {
        connect: pokemonDetail.types.map(typeItem => { return { name: typeItem.type.name } })
      },
      pokemon_species_name: pokemonDetail.species.name,
      is_default: pokemonDetail.is_default,
    },
    create: {
      pokemon_id: pokemonDetail.id,
      name: pokemonDetail.name,
      weight: pokemonDetail.weight,
      types: {
        connect: pokemonDetail.types.map(typeItem => { return { name: typeItem.type.name } })
      },
      pokemon_species_name: pokemonDetail.species.name,
      is_default: pokemonDetail.is_default,
    }
  })

  // upsert pokemon sprites
  await prisma.pokemonSprites.upsert({
    where: {
      pokemon_id: pokemonDetail.id,
    },
    update: {
      front_default: pokemonDetail.sprites.front_default || '',
      front_shiny: pokemonDetail.sprites.front_shiny || '',
      front_female: pokemonDetail.sprites.front_female || '',
      front_shiny_female: pokemonDetail.sprites.front_shiny_female || '',
      back_default: pokemonDetail.sprites.back_default || '',
      back_shiny: pokemonDetail.sprites.back_shiny || '',
      back_female: pokemonDetail.sprites.back_female || '',
      back_shiny_female: pokemonDetail.sprites.back_shiny_female || '',
    },
    create: {
      pokemon_id: pokemonDetail.id,
      front_default: pokemonDetail.sprites.front_default || '',
      front_shiny: pokemonDetail.sprites.front_shiny || '',
      front_female: pokemonDetail.sprites.front_female || '',
      front_shiny_female: pokemonDetail.sprites.front_shiny_female || '',
      back_default: pokemonDetail.sprites.back_default || '',
      back_shiny: pokemonDetail.sprites.back_shiny || '',
      back_female: pokemonDetail.sprites.back_female || '',
      back_shiny_female: pokemonDetail.sprites.back_shiny_female || '',
    }
  })

  // upsert pokemon stats
  await prisma.pokemonStats.upsert({
    where: {
      pokemon_id: pokemonDetail.id,
    },
    update: {
      name: pokemonDetail.name,
      base_hp: pokemonDetail.stats.find(statItem => statItem.stat.name == "hp")?.base_stat,
      effort_hp: pokemonDetail.stats.find(statItem => statItem.stat.name == "hp")?.effort,
      base_atk: pokemonDetail.stats.find(statItem => statItem.stat.name == "attack")?.base_stat,
      effort_atk: pokemonDetail.stats.find(statItem => statItem.stat.name == "attack")?.effort,
      base_def: pokemonDetail.stats.find(statItem => statItem.stat.name == "defense")?.base_stat,
      effort_def: pokemonDetail.stats.find(statItem => statItem.stat.name == "defense")?.effort,
      base_sa: pokemonDetail.stats.find(statItem => statItem.stat.name == "special-attack")?.base_stat,
      effort_sa: pokemonDetail.stats.find(statItem => statItem.stat.name == "special-attack")?.effort,
      base_sd: pokemonDetail.stats.find(statItem => statItem.stat.name == "special-defense")?.base_stat,
      effort_sd: pokemonDetail.stats.find(statItem => statItem.stat.name == "special-defense")?.effort,
      base_spd: pokemonDetail.stats.find(statItem => statItem.stat.name == "speed")?.base_stat,
      effort_spd: pokemonDetail.stats.find(statItem => statItem.stat.name == "speed")?.effort,
    },
    create: {
      pokemon_id: pokemonDetail.id,
      name: pokemonDetail.name,
      base_hp: pokemonDetail.stats.find(statItem => statItem.stat.name == "hp")?.base_stat || 0,
      effort_hp: pokemonDetail.stats.find(statItem => statItem.stat.name == "hp")?.effort || 0,
      base_atk: pokemonDetail.stats.find(statItem => statItem.stat.name == "attack")?.base_stat || 0,
      effort_atk: pokemonDetail.stats.find(statItem => statItem.stat.name == "attack")?.effort || 0,
      base_def: pokemonDetail.stats.find(statItem => statItem.stat.name == "defense")?.base_stat || 0,
      effort_def: pokemonDetail.stats.find(statItem => statItem.stat.name == "defense")?.effort || 0,
      base_sa: pokemonDetail.stats.find(statItem => statItem.stat.name == "special-attack")?.base_stat || 0,
      effort_sa: pokemonDetail.stats.find(statItem => statItem.stat.name == "special-attack")?.effort || 0,
      base_sd: pokemonDetail.stats.find(statItem => statItem.stat.name == "special-defense")?.base_stat || 0,
      effort_sd: pokemonDetail.stats.find(statItem => statItem.stat.name == "special-defense")?.effort || 0,
      base_spd: pokemonDetail.stats.find(statItem => statItem.stat.name == "speed")?.base_stat || 0,
      effort_spd: pokemonDetail.stats.find(statItem => statItem.stat.name == "speed")?.effort || 0,
    }
  })

  // connect pokemon to ability
  for (const abilityItem of pokemonDetail.abilities) {
    const abilityDetail = await getPokemonAbilityByName(abilityItem.ability.name)
    if (!abilityDetail) continue
    await prisma.pokemonToAbility.upsert({
      where: {
        pokemon_id_ability_id: {
          pokemon_id: pokemonDetail.id,
          ability_id: abilityDetail.ability_id,
        }
      },
      update: {
        pokemon_id: pokemonDetail.id,
        ability_id: abilityDetail.ability_id,
        is_hidden: abilityItem.is_hidden,
        slot: abilityItem.slot,
      },
      create: {
        pokemon_id: pokemonDetail.id,
        ability_id: abilityDetail.ability_id,
        is_hidden: abilityItem.is_hidden,
        slot: abilityItem.slot,
      }
    })
  }
}

// fetch all pokemon sprites and save in server
export const fetchPokemonSprites = async () => {
  const pokemonSpritesList = await prisma.pokemonSprites.findMany()

  const spritesPropsList = [
    'front_default',
    'front_shiny',
    'front_female',
    'front_shiny_female',
    'back_default',
    'back_shiny',
    'back_female',
    'back_shiny_female',
  ]

  const fetchAndSaveImage = async (imageUrl: string, pokemonId: number, fileName: string) => {
    const data = await fetch(imageUrl)
    const arrayBuffer = await data.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const spritesDir = 'public/pokemon/sprites'
    const dir = `${spritesDir}/${pokemonId}`

    await fs.promises.mkdir(dir, { recursive: true }).catch(console.error);
    await fs.writeFileSync(`${dir}/${fileName}`, buffer);
  }

  for (const pokemonSpritesObj of pokemonSpritesList) {
    const pokemonId = pokemonSpritesObj.pokemon_id
    // fetch front back sprites
    for (const prop in pokemonSpritesObj) {
      if (spritesPropsList.includes(prop)) {
        const imageUrl = pokemonSpritesObj[prop as keyof typeof pokemonSpritesObj]

        if (imageUrl && typeof imageUrl == 'string') {
          await fetchAndSaveImage(imageUrl, pokemonId, `${prop}.png`)
        }
      }
    }
    // fetch other sprites
    const pokemonDetail = await pokemonApi.getPokemonById(pokemonId)
    type SpriteItem = {
      fileName: string
      imageUrl: string
    }
    const otherSpritesList: SpriteItem[] = [
      {
        fileName: 'front_offical.png',
        imageUrl: pokemonDetail.sprites.other?.['official-artwork']?.front_default || ''
      },
      {
        fileName: 'front_offical_shiny.png',
        // @ts-expect-error : front_shiny is not defined in the type definition
        imageUrl: pokemonDetail.sprites.other?.['official-artwork']?.front_shiny || ''
      },
      {
        fileName: 'front_default_animated.gif',
        imageUrl: pokemonDetail.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || ''
      },
      {
        fileName: 'front_shiny_animated.gif',
        imageUrl: pokemonDetail.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_shiny || ''
      },
      {
        fileName: 'front_female_animated.gif',
        imageUrl: pokemonDetail.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_female || ''
      },
      {
        fileName: 'front_shiny_female_animated.gif',
        imageUrl: pokemonDetail.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_shiny_female || ''
      },
      {
        fileName: 'back_default_animated.gif',
        imageUrl: pokemonDetail.sprites.versions?.['generation-v']?.['black-white']?.animated?.back_default || ''
      },
      {
        fileName: 'back_shiny_animated.gif',
        imageUrl: pokemonDetail.sprites.versions?.['generation-v']?.['black-white']?.animated?.back_shiny || ''
      },
      {
        fileName: 'back_female_animated.gif',
        imageUrl: pokemonDetail.sprites.versions?.['generation-v']?.['black-white']?.animated?.back_female || ''
      },
      {
        fileName: 'back_shiny_female_animated.gif',
        imageUrl: pokemonDetail.sprites.versions?.['generation-v']?.['black-white']?.animated?.back_shiny_female || ''
      },
    ]
    for (const spriteItem of otherSpritesList) {
      if (spriteItem.imageUrl) {
        await fetchAndSaveImage(spriteItem.imageUrl, pokemonId, spriteItem.fileName)
      }
    }
  }
}

export const getPokemonSpeciesDetailByName = async (pokemonName: string) => {
  if (pokemonName) {
    const entries = await prisma.pokemonSpecies.findUnique({
      where: {
        name: pokemonName,
      },
      select: {
        pokemon_species_id: true,
        name: true,
        name_jp: true,
        name_zh: true,
        gender_rate: true,
        capture_rate: true,
        is_legendary: true,
        is_mythical: true,
        pokedex_entries: {
          select: {
            pokedex_name: true,
            entry_number: true,
          }
        },
        evolves_from_species_name: true,
        generation_name: true,
        pokemons: {
          select: {
            pokemon_id: true,
            name: true,
            weight: true,
            abilities: {
              select: {
                ability: {
                  select: {
                    name: true,
                    name_jp: true,
                    name_zh: true,
                    effect: true,
                    short_effect: true,
                  }
                },
                is_hidden: true,
                slot: true,
              }
            },
            pokemon_stats: {
              select: {
                base_hp: true,
                effort_hp: true,
                base_atk: true,
                effort_atk: true,
                base_def: true,
                effort_def: true,
                base_sa: true,
                effort_sa: true,
                base_sd: true,
                effort_sd: true,
                base_spd: true,
                effort_spd: true,
              }
            },
            types: {
              select: {
                name: true,
                name_jp: true,
                name_zh: true,
              }
            },
            is_default :true,
          }
        },
      }
    })
    return entries
  }
}

export const checkFileExists = async (imageUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(imageUrl, {
      method: 'HEAD',
      cache: 'no-cache' // Prevent caching of the HEAD request
    });
    return response.status === 200;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

export const getPokemonSpeciesNamesEvolveTo = async (pokemonName: string) => {
  if (pokemonName) {
    const entries = await prisma.pokemonSpecies.findMany({
      where: {
        evolves_from_species_name: pokemonName,
      },
      select: {
        name: true,
      }
    })
    return entries.map(item => item.name)
  }
}
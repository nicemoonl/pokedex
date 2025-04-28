'use client'
import { checkFileExists, getPokemonsByGeneration, getPokemonsByGenerationType, getPokemonSpeciesDetailByName, getPokemonSpeciesNamesEvolveTo } from "@/data/pokedb";
import { Button, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Select, SelectItem, Spinner } from "@heroui/react"
import React, { useEffect, useState, useTransition } from "react";
import Image from 'next/image'
import { getCldImageUrl } from 'next-cloudinary'

/* const dependencies declaration */
type PokemonDetail = NonNullable<Awaited<ReturnType<typeof getPokemonSpeciesDetailByName>>>
const typeList = [
  { key: 'all', label: 'All Types' },
  { key: 'normal', label: 'Normal' },
  { key: 'fire', label: 'Fire' },
  { key: 'water', label: 'Water' },
  { key: 'grass', label: 'Grass' },
  { key: 'electric', label: 'Electric' },
  { key: 'ice', label: 'Ice' },
  { key: 'fighting', label: 'Fighting' },
  { key: 'poison', label: 'Poison' },
  { key: 'ground', label: 'Ground' },
  { key: 'flying', label: 'Flying' },
  { key: 'psychic', label: 'Psychic' },
  { key: 'bug', label: 'Bug' },
  { key: 'rock', label: 'Rock' },
  { key: 'ghost', label: 'Ghost' },
  { key: 'dragon', label: 'Dragon' },
  { key: 'dark', label: 'Dark' },
  { key: 'steel', label: 'Steel' },
  { key: 'fairy', label: 'Fairy' },
];
const useCloudinaryImages = true
const localSpritesDir = '/pokemon/sprites'
// const cloudinaryBaseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
const getSpritePath = (pokemonId: string | number, imageName: string) => {
  if (useCloudinaryImages) {
    return getCldImageUrl({
      width: 512,
      height: 512,
      src: `pokemon/sprites/${pokemonId}/${imageName}`,
      preserveTransformations: true
    })
  }
  return `${localSpritesDir}/${pokemonId}/${imageName}`
}
const generationList = [
  {
    key: '0',
    label: 'National',
  },
  {
    key: '1',
    label: 'Generation I',
  },
  {
    key: '2',
    label: 'Generation II',
  },
  {
    key: '3',
    label: 'Generation III',
  },
  {
    key: '4',
    label: 'Generation IV',
  },
  {
    key: '5',
    label: 'Generation V',
  },
  {
    key: '6',
    label: 'Generation VI',
  },
  {
    key: '7',
    label: 'Generation VII',
  },
  {
    key: '8',
    label: 'Generation VIII',
  },
  {
    key: '9',
    label: 'Generation IX',
  },
]
const typeColors = [
  { type: 'normal', color: '#A8A878' },
  { type: 'fighting', color: '#C03028' },
  { type: 'flying', color: '#A890F0' },
  { type: 'poison', color: '#A040A0' },
  { type: 'ground', color: '#E0C068' },
  { type: 'rock', color: '#B8A038' },
  { type: 'bug', color: '#A8B820' },
  { type: 'ghost', color: '#705898' },
  { type: 'steel', color: '#B8B8D0' },
  { type: 'fire', color: '#F08030' },
  { type: 'water', color: '#6890F0' },
  { type: 'grass', color: '#78C850' },
  { type: 'electric', color: '#F8D030' },
  { type: 'psychic', color: '#F85888' },
  { type: 'ice', color: '#98D8D8' },
  { type: 'dragon', color: '#7038F8' },
  { type: 'dark', color: '#705848' },
  { type: 'fairy', color: '#EE99AC' },
  { type: 'stellar', color: '#87CEEB' },
  { type: 'unknown', color: '#A8A878' },
  { type: 'shadow', color: '#A8A878' },
]
const typeChipBgStyles = (typeName: string) => {
  return {
    backgroundColor: typeColors.find(item => item.type == typeName)?.color || '#A8A878',
    color: '#FFFFFF',
  }
}
const panelBgStyles = (typeName1: string, typeName2?: string) => {
  const borderWidth = 5
  const styles = {
    borderRadius: `20px`,
  } satisfies React.CSSProperties
  if (typeName2) {
    return {
      ...styles,
      backgroundImage: `linear-gradient(white, white), linear-gradient(to right, ${typeColors.find(item => item.type == typeName1)?.color}, ${typeColors.find(item => item.type == typeName2)?.color})`,
      backgroundOrigin: `border-box`,
      backgroundClip: `padding-box, border-box`,
      border: `double ${borderWidth}px transparent`,
    } satisfies React.CSSProperties
  } else if (typeName1) {
    return {
      ...styles,
      borderWidth: `${borderWidth}px`,
      borderColor: `${typeColors.find(item => item.type == typeName1)?.color}`,
    } satisfies React.CSSProperties
  }
}

export default function View() {
  /* declaration */
  const [pageLanguage, setPageLanguage] = useState('en') // 'en' / 'ch' / 'jp' ; affect pokemon name only
  const [generationKey, setGenerationKey] = React.useState<string>('1');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [pokemonList, setPokemonList] = React.useState<getPokemonsByGenerationType[]>([])
  const [isPending, startTransition] = useTransition()
  const [isShiny, setIsShiny] = useState(false)
  const [variationId, setVariationId] = useState(0)
  const [activePokemonName, setActivePokemonName] = useState('')
  const [activePokemonData, setActivePokemonData] = useState<PokemonDetail | null>(null)
  const [activePokemonImageUrl, setActivePokemonImageUrl] = useState('')
  const [activePokemonEvolutionChains, setActivePokemonEvolutionChains] = useState<PokemonDetail[][] | null>([])
  const [variationThumbnails, setVariationThumbnails] = useState<string[]>([])
  const [displayPokemonInfoPanel, setDisplayPokemonInfoPanel] = useState(false) // control transition of right panel

  /* general function */
  const localize = (eng: string, chi?: string | null, jap?: string | null) => {
    if (pageLanguage == 'jp' && jap) {
      return jap
    } else if (pageLanguage == 'ch' && chi) {
      return chi
    } else {
      return eng
    }
  }

  /* handler */
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageLanguage(e.target.value)
  }

  const handleGenerationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(async () => {
      const newValue = e.target.value
      setGenerationKey(newValue)
    })
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(async () => {
      setTypeFilter(e.target.value);
    })
  }

  const handlePokemonCardClick = (pokemonName: string) => {
    setIsShiny(false)
    setVariationId(0)
    setActivePokemonName(pokemonName)
  }

  /* views */
  const pokemonTypesView = () => {
    if (activePokemonData) {
      const types = activePokemonData.pokemons[variationId]?.types || activePokemonData.pokemons[0]?.types
      if (types) {
        return (
          <>
            <div className="flex space-x-2">
              {types.map(type => {
                return (
                  <div key={type.name} className={'rounded-full shadow-md flex items-center text-white pl-2 pr-3 py-0.5 space-x-2 cursor-pointer'}
                    style={{ backgroundColor: typeColors.find(item => item.type == type.name)?.color || '#A8A878' }}
                    onClick={() => setTypeFilter(type.name)}>
                    <span className={''}>
                      <Image
                        src={`/pokemontype/30px-${type.name.charAt(0).toUpperCase() + type.name.slice(1)}_icon.png`}
                        width={16}
                        height={16}
                        alt={type.name}
                      />
                    </span>
                    <span className="capitalize">
                      {type.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )
      }
    }
    return (<></>)
  }

  const pokemonAbilitiesView = () => {
    if (activePokemonData) {
      const abilities = activePokemonData.pokemons[variationId]?.abilities || []
      if (abilities && abilities.length) {
        return (
          <>
            <div className="w-full flex space-x-4 flex-wrap">
              {abilities.map(abilityItem => {
                if (abilityItem && abilityItem.ability) {
                  return (
                    <React.Fragment key={abilityItem.ability.name}>
                      <div className={'grow basis-1 flex justify-center ' + (abilityItem.is_hidden && 'text-neutral-500')}>
                        {(abilityItem.ability.effect || abilityItem.ability.short_effect) ?
                          <Popover placement="bottom" offset={10}>
                            <PopoverTrigger>
                              <Button className="w-full bg-white shadow-md border-1">
                                {abilityItem.ability.name}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <div className="max-w-[25vw]">
                                {abilityItem.ability.effect || abilityItem.ability.short_effect}
                              </div>
                            </PopoverContent>
                          </Popover> :
                          <Button isDisabled>
                            {abilityItem.ability.name}
                          </Button>
                        }
                      </div>
                    </React.Fragment>
                  )
                }
                return (<></>)
              })}
            </div>
          </>
        )
      }
    }
    return (<></>)
  }

  const pokemonStatsView = () => {
    if (activePokemonData) {
      const stats = activePokemonData.pokemons[variationId]?.pokemon_stats
      if (stats) {
        return (
          <>
            <div className="flex space-x-4">
              <div className="flex flex-col justify-center items-center">
                <span>HP</span>
                <span>{stats.base_hp}</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span>Atk</span>
                <span>{stats.base_atk}</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span>Def</span>
                <span>{stats.base_def}</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span>SpA</span>
                <span>{stats.base_sa}</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span>SpD</span>
                <span>{stats.base_sd}</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span>Spd</span>
                <span>{stats.base_spd}</span>
              </div>
              <div className="flex flex-col justify-center items-center">
                <span>Total</span>
                <span>{stats.base_hp + stats.base_atk + stats.base_def + stats.base_sa + stats.base_sd + stats.base_spd}</span>
              </div>
            </div>
          </>
        )
      }
    }
    return (<></>)
  }

  const evolutionChainView = () => {
    const evolveChains = activePokemonEvolutionChains
    if (evolveChains && evolveChains.length) {
      return (
        <>
          <div className="flex flex-col space-y-2">
            {evolveChains.map((evolveChain, index) => {
              return (
                <div key={index} className="flex space-x-2 items-center">
                  {evolveChain.map((pokemonData, index) => {
                    return (
                      <React.Fragment key={pokemonData.pokemon_species_id}>
                        <div className="flex flex-col items-center cursor-pointer group/evolve-pokemon-card"
                          onClick={() => handlePokemonCardClick(pokemonData.name)}>
                          <div className="w-16 h-16 rounded-full overflow-hidden">
                            <Image
                              src={getSpritePath(pokemonData?.pokemons[0]?.pokemon_id, 'front_default.png')}
                              alt={pokemonData?.name || ''}
                              width={120}
                              height={120}
                              className="w-full h-full object-cover transition-all duration-200 group-hover/evolve-pokemon-card:scale-125"
                            />
                          </div>
                          <div className="text-xs text-center">
                            {localize(pokemonData.name, pokemonData.name_zh, pokemonData.name_jp)}
                          </div>
                        </div>
                        {index !== evolveChain.length - 1 && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20"><path fill="currentColor" fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10" clipRule="evenodd" /></svg>
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </>
      )
    }

    return (
      <></>
    )
  }

  const selectionStartContentView = () => {
    if (typeFilter == 'all') {
      return (<></>)
    } else {
      return (
        <span className={'w-6 h-6 shrink-0 rounded-full flex justify-center items-center'} style={typeChipBgStyles(typeFilter)}>
          <Image
            src={`/pokemontype/30px-${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}_icon.png`}
            width={16}
            height={16}
            alt={typeFilter} />
        </span>
      )
    }
  }

  const pokemonVariationsView = () => {
    const handleOnClick = (index: number) => {
      if (index == variationId) {
        setIsShiny(!isShiny)
      } else {
        setIsShiny(false)
        setVariationId(index)
      }
    }

    const pokemonVariationsViewList = () => {
      if (activePokemonData) {
        const defaultThumbnail = getSpritePath(activePokemonData.pokemons[0].pokemon_id, 'front_default.png')
        return (
          activePokemonData.pokemons.map((variation, index) => {
            let variationName = ''
            if (variation.name == activePokemonData.name) {
              variationName = 'default'
            } else if (variation.name?.split('-')[0] == activePokemonData.name) {
              variationName = variation.name?.replace(activePokemonData.name, '').replace('-', ' ').trim()
            }
            if (variationId == index && !isShiny) {
              variationName += '\nshiny'
            }
            if (variationThumbnails[index]) {
              return (
                <div key={index} className="flex flex-col items-center cursor-pointer group/variation-pokemon-card basis-[calc(25%-12px)]"
                  onClick={() => { handleOnClick(index) }}>
                  <div className="w-16 h-16 transition-all duration-200 group-hover/variation-pokemon-card:scale-125">
                    <Image
                      src={variationThumbnails[index] || defaultThumbnail}
                      width={'100'}
                      height={'100'}
                      alt={variationName}
                    />
                  </div>
                  <p className="text-xs capitalize whitespace-pre text-center">
                    {variationName}
                  </p>
                </div>
              )
            }
          })
        )
      }
    }

    if (activePokemonData) {
      return (
        <div className="flex gap-4 w-full flex-wrap">
          {pokemonVariationsViewList()}
        </div>
      )
    }
  }

  /* effects */
  // on filter update
  useEffect(() => {
    const updatePokemonList = async () => {
      if (generationKey == '-1') {

      } else {
        let list = await getPokemonsByGeneration(generationKey)
        if (list) {
          if (typeFilter != 'all') {
            list = list.filter(pokemonSpecies => pokemonSpecies.pokemons[0]?.types.find(type => type.name == typeFilter))
          }
          setPokemonList([...list])
        } else {
          setPokemonList([])
        }
      }
    }

    updatePokemonList()
  }, [generationKey, typeFilter]) // Empty dependency array means this runs once on mount

  // on selection update
  useEffect(() => {
    const resetPokemonStates = () => {
      setActivePokemonData(null)
      setActivePokemonImageUrl('')
      setActivePokemonEvolutionChains([])
      setVariationThumbnails([])
    }
    const initEvolutionChain = async (activePokemonData: PokemonDetail) => {
      const evolveChains = []
      const evolveLeaves = []

      // get all of the leaves for the evolution chain
      const evolvesToSpeciesNames = await getPokemonSpeciesNamesEvolveTo(activePokemonData.name)
      if (evolvesToSpeciesNames && evolvesToSpeciesNames.length) {
        for (const evolvesToSpeciesName of evolvesToSpeciesNames) {
          const evolveToSpeciesData = await getPokemonSpeciesDetailByName(evolvesToSpeciesName)
          if (evolveToSpeciesData) {
            const evolvesToSpeciesNames2 = await getPokemonSpeciesNamesEvolveTo(evolveToSpeciesData.name)
            if (evolvesToSpeciesNames2 && evolvesToSpeciesNames2.length) {
              for (const evolvesToSpeciesName2 of evolvesToSpeciesNames2) {
                const evolveToSpeciesData2 = await getPokemonSpeciesDetailByName(evolvesToSpeciesName2)
                if (evolveToSpeciesData2) {
                  evolveLeaves.push(evolveToSpeciesData2)
                }
              }
            } else {
              evolveLeaves.push(evolveToSpeciesData)
            }
          }
        }
      }

      if (!evolveLeaves.length) {
        evolveLeaves.push(activePokemonData)
      } else {
        evolveLeaves.sort((a, b) =>
          a.pokemon_species_id - b.pokemon_species_id
        )
      }

      // get evolve chain for each evolve leaf
      for (const pokemonData of evolveLeaves) {
        const evolvesFromSpeciesName = pokemonData.evolves_from_species_name
        const evolveChain = []
        if (evolvesFromSpeciesName) {
          const evolvesFromSpeciesData = await getPokemonSpeciesDetailByName(evolvesFromSpeciesName)
          if (evolvesFromSpeciesData) {
            const evolvesFromSpeciesName2 = evolvesFromSpeciesData.evolves_from_species_name
            if (evolvesFromSpeciesName2) {
              const evolvesFromSpeciesData2 = await getPokemonSpeciesDetailByName(evolvesFromSpeciesName2)
              if (evolvesFromSpeciesData2) {
                evolveChain.push(evolvesFromSpeciesData2)
              }
            }
            evolveChain.push(evolvesFromSpeciesData)
          }
        }
        if (evolveChain.length) {
          evolveChain.push(pokemonData)
          evolveChains.push(evolveChain)
        }
      }

      if (evolveChains && evolveChains.length) {
        setActivePokemonEvolutionChains(evolveChains)
      }
    }

    if (activePokemonName) {// get pokemon detail from db
      getPokemonSpeciesDetailByName(activePokemonName).then(async data => {
        if (data) {
          resetPokemonStates()
          setActivePokemonData(data)

          // generate evolution chain
          initEvolutionChain(data)
        }
      })
    } else {
      resetPokemonStates()
    }
    return () => {
      resetPokemonStates()
    }
  }, [activePokemonName])

  // on variation update
  useEffect(() => {
    const initMainImage = async () => {
      if (activePokemonData) {
        let imageUrl = getSpritePath(activePokemonData.pokemons[variationId]?.pokemon_id, `front_offical${isShiny ? '_shiny' : ''}.png`)
        if (await !checkFileExists(imageUrl)) {
          imageUrl = getSpritePath(activePokemonData.pokemons[0].pokemon_id, 'front_default.png')
        }
        setActivePokemonImageUrl(imageUrl)
      }
    }

    const initVariationThumbnails = async () => {
      if (activePokemonData) {
        const imageUrlList = []
        for (const [index, pokemon] of activePokemonData.pokemons.entries()) {
          // eslint-disable-next-line prefer-const
          let imageUrl = getSpritePath(pokemon.pokemon_id, `front_${index == variationId && !isShiny ? 'shiny' : 'default'}.png`)
          // check exist is not working here
          // const exist = await checkFileExists(imageUrl)
          // if (!exist) {
          //   imageUrl = `${spritesDir}/${activePokemonData.pokemons[0].pokemon_id}/front_default.png`
          // }
          imageUrlList.push(imageUrl)
        }
        setVariationThumbnails(imageUrlList)
      }
    }

    if (activePokemonData) {
      // set pokemon image
      initMainImage()

      // generate variation thumbnails
      initVariationThumbnails()

      // start animation and display pokemon info panel
      setDisplayPokemonInfoPanel(true)
    } else {
      setDisplayPokemonInfoPanel(false)
    }
  }, [activePokemonData, isShiny, variationId])

  return (
    <>
      <div className="flex pt-5 h-full">
        {/* left panel */}
        <section className="grow h-full pr-5 flex flex-col">
          {/* dropdown selection */}
          <div className="flex items-center pb-[14px] border-b-1 space-x-2">
            <div className="basis-[200px]">
              <Select
                className="max-w-xs"
                label="Select an Generation"
                selectionMode="single"
                selectedKeys={[generationKey]}
                onChange={handleGenerationChange}
                isDisabled={isPending}
              >
                {generationList.map((generationItem) => (
                  <SelectItem key={generationItem.key}>{generationItem.label}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="basis-[200px]">
              <Select
                className="max-w-xs"
                label="Select a Type"
                selectedKeys={[typeFilter]}
                onChange={handleTypeChange}
                isDisabled={isPending}
                startContent={selectionStartContentView()}
              >
                {typeList.map((type) => {
                  if (type.key == 'all') {
                    return (
                      <SelectItem key={type.key}
                        startContent={
                          <span className="w-6 h-6"></span>
                        }>
                        {type.label}
                      </SelectItem>
                    )
                  } else {
                    return (
                      <SelectItem key={type.key}
                        startContent={
                          <span className={'w-6 h-6 rounded-full flex justify-center items-center'} style={typeChipBgStyles(type.key)} >
                            <Image
                              src={`/pokemontype/30px-${type.key.charAt(0).toUpperCase() + type.key.slice(1)}_icon.png`}
                              width={16}
                              height={16}
                              alt={type.key} />
                          </span>
                        }>
                        {type.label}
                      </SelectItem>
                    )
                  }
                })}
              </Select>
            </div>
            <div className="basis-[200px]">
              <Select
                className="max-w-xs"
                label="Pokemon Name Language"
                selectedKeys={[pageLanguage]}
                onChange={handleLanguageChange}
                isDisabled={isPending}
              >
                <SelectItem key={'en'}>
                  {'English'}
                </SelectItem>
                <SelectItem key={'ch'}>
                  {'Traditional Chinese'}
                </SelectItem>
                <SelectItem key={'jp'}>
                  {'Japanese'}
                </SelectItem>
              </Select>
            </div>
            <div className="ml-4">
              {isPending && <Spinner size="sm" />}
            </div>
          </div>
          {/* pokemon list */}
          <div style={{ height: 'calc(100% - 70px)' }}>
            <ScrollShadow hideScrollBar className="h-full">
              <div className="flex flex-wrap items-stretch py-4">
                {pokemonList.map((pokemonSpecies) => (
                  <div key={pokemonSpecies.order}
                    className="basis-[11.1%] flex flex-col items-center cursor-pointer group/pokemon-card"
                    onClick={() => { handlePokemonCardClick(pokemonSpecies.name) }}>
                    <div className="transition-all duration-200 group-hover/pokemon-card:scale-125">
                      <Image
                        src={getSpritePath(pokemonSpecies.pokemons[0]?.pokemon_id, 'front_default.png')}
                        width={'100'}
                        height={'100'}
                        alt={pokemonSpecies.name}
                      />
                    </div>
                    <p className="text-sm">
                      {localize(pokemonSpecies.name, pokemonSpecies.name_zh, pokemonSpecies.name_jp)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollShadow >
          </div>
        </section>
        {/* right panel */}
        <section className="shrink-0 basis-[400px] max-w-[400px] h-full">
          {activePokemonData &&
            <div className={"w-full h-full pb-[20px] duration-300 transition-all ease-out " + (displayPokemonInfoPanel ? "translate-x-0 opacity-100" : "translate-x-full opacity-0")}>
              <div className="flex flex-col pt-6 h-full shadow-xl" style={panelBgStyles(activePokemonData?.pokemons[variationId].types[0].name || '', activePokemonData?.pokemons[variationId].types[1]?.name || '')}>
                {/* pokemon main image and name and type */}
                <div className="w-full px-6 shrink-0">
                  {activePokemonData &&
                    <div className="aspect-square">
                      <Image
                        src={activePokemonImageUrl || getSpritePath(activePokemonData.pokemons[0].pokemon_id, 'front_default.png')}
                        width={'475'}
                        height={'475'}
                        alt={activePokemonData.name}
                      />
                    </div>
                  }
                  <div className="mt-2 py-2 w-full flex flex-col items-center">
                    {activePokemonData &&
                      <div className="text-lg text-center">
                        {localize(activePokemonData.name, activePokemonData.name_zh, activePokemonData.name_jp)}
                      </div>
                    }
                    <div className="mt-2">
                      {pokemonTypesView()}
                    </div>
                  </div>
                </div>
                {/* pokemon info section */}
                <div className="grow basis-auto h-0 pt-2">
                  <ScrollShadow hideScrollBar className="h-full px-6 pb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-full flex flex-col items-center">
                        <div className="text-sm w-full pb-1 text-center">Abilities</div>
                        <div className="w-full">
                          {pokemonAbilitiesView()}
                        </div>
                      </div>
                      <div className="mt-2 py-2 rounded-lg w-full flex flex-col items-center">
                        <div className="text-sm w-fulltext-center">Stats</div>
                        <div className="mt-1 border-2 border-grey-100 bg-white bg-opacity-50 shadow-md rounded-xl w-full flex flex-col items-center py-1">
                          {pokemonStatsView()}
                        </div>
                      </div>
                      <div className="mt-2 py-2 w-full flex flex-col items-center">
                        <div className="text-sm w-full text-center">Evolution</div>
                        <div className="mt-1 border-2 border-grey-100 bg-white bg-opacity-50 shadow-md rounded-xl w-full flex flex-col items-center py-1">
                          {evolutionChainView()}
                        </div>
                      </div>
                      <div className="mt-2 py-2 w-full flex flex-col items-center">
                        <div className="text-sm w-full text-center">Variations</div>
                        <div className="mt-1 border-2 border-grey-100 bg-white bg-opacity-50 shadow-md rounded-xl w-full flex flex-col items-center p-1">
                          {pokemonVariationsView()}
                        </div>
                      </div>
                    </div>
                  </ScrollShadow>
                </div>
              </div>
            </div>}
        </section>
      </div>
    </>
  )
}
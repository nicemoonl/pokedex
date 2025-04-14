'use client'
import { Button } from "@heroui/button";
import { fetchGeneration, fetchPokedex, fetchPokemonAbility, fetchPokemonSpecies, fetchPokemonSprites, fetchPokemonType, fetchVersion, fetchVersionGroup } from '@/data/pokedb'
import { useState } from "react";

interface buttonModel {
  label: string
  action: () => Promise<void>
  isLoading: boolean
}

export default function FetchButton() {
  const initialButtonList = [
    {
      label: 'Fetch Generations',
      action: fetchGeneration,
      isLoading: false,
    },
    {
      label: 'Fetch Version Group',
      action: fetchVersionGroup,
      isLoading: false,
    },
    {
      label: 'Fetch Version',
      action: fetchVersion,
      isLoading: false,
    },
    {
      label: 'Fetch Pokedex',
      action: fetchPokedex,
      isLoading: false,
    },
    {
      label: 'Fetch Pokemon Types',
      action: fetchPokemonType,
      isLoading: false,
    },
    {
      label: 'Fetch Pokemon Abilities',
      action: fetchPokemonAbility,
      isLoading: false,
    },
    {
      label: 'Fetch Pokemon Species',
      action: fetchPokemonSpecies,
      isLoading: false,
    },
    {
      label: 'Fetch Pokemon Sprites',
      action: fetchPokemonSprites,
      isLoading: false,
    },
  ]
  const [buttonList, setButtonList] = useState<buttonModel[]>(initialButtonList)

  const buttonOnPress = async (buttonModel: buttonModel, index: number) => {
    if (buttonList[index].isLoading) return
    buttonList[index].isLoading = true
    setButtonList([...buttonList])
    await buttonModel.action()
    buttonList[index].isLoading = false
    setButtonList([...buttonList])
  }

  return (
    <>
      <div className="m-[-10px] flex flex-wrap">
        {
          buttonList.map((item, index) => (
            <div key={item.label} className="p-[10px]">
              <Button color="primary" isLoading={item.isLoading} onPress={() => buttonOnPress(item, index)}>
                {item.label}
              </Button>
            </div>
          ))
        }
      </div>
    </>
  )
}
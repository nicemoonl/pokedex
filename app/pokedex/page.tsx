import type { Metadata } from "next";
import Pokedexview from "./pokedexview";

export const metadata: Metadata = {
  title: "Pokedex List",
  description: "Database of Pokemon Universe",
};

export default function Page() {
  // page meta
  // const currentPath = "/pokedex"

  return (
    <>
      <div className="max-w-[1480px] mx-auto px-[40px] h-full">
        <Pokedexview></Pokedexview>
      </div>
    </>
  )
}
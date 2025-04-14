import Container from "@/app/components/container";
import Link from 'next/link'
import { redirect } from "next/navigation";

export default async function Page() {
  redirect(`/pokedb/pokedex`)
  const currentPath = "/pokedb"
  return (
    <>
      <Container>
        <h1 className="text-4xl mb-4">Poke DB</h1>
        <Link href={`${currentPath}/pokedex`}>Pokedex</Link>
        <Link href={`${currentPath}/fetchpage`}>Fetch Page</Link>
        <div className="mt-[40px]">
        </div>
      </Container>
    </>
  )
}
import Container from "@/app/components/container";
import FetchButton from "./fetchButton";
import { redirect } from "next/navigation";

export default async function Page() {
  redirect(`/pokedb/pokedex`)
  // const currentPath = "/pokedb/fetchpage"

  return (
    <>
      <Container>
        <h1 className="text-4xl mb-4">Poke DB Fetch Page</h1>
        <div className="mt-[40px]">
          <FetchButton></FetchButton>
        </div>
      </Container>
    </>
  )
}
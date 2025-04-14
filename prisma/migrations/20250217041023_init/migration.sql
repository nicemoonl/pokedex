-- CreateTable
CREATE TABLE "Pokemons" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Pokemons_name_key" ON "Pokemons"("name");

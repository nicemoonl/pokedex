import Container from "@/app/components/container";

export default function Header() {
  return (
    <>
      <header className="h-[70px] bg-white/75 backdrop-blur border-b -mb-px sticky top-0 z-50 border-gray-200 dark:border-gray-800">
        <Container>
          <div className="h-[70px] flex justify-between items-center">
            {/* main logo */}
            <div className="h-full flex items-center">
              <span className="text-2xl text-emerald-600">Next Project</span>
            </div>
            {/* navbar */}
            <div className="flex items-center gap-8">
            </div>
          </div>
        </Container>
      </header>
    </>
  )
}
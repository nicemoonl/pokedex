import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poke DB",
  description: "Database of Pokemon Universe",
  icons: {
    icon: '/pokeball.ico',
    shortcut: '/pokeball.png',
    apple: '/pokeball.png',
  },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
  title: React.ReactNode;
}>) {
  return (
    <>
      <div className="w-full overflow-hidden bg-slate-50" style={{height: '100vh'}}>
        {children}
      </div>
    </>
  );
}

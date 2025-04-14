export default function Container({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="max-w-[1480px] mx-auto px-[40px]">
        {children}
      </div>
    </>
  )
}
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header cartCount={0} />
      <main className="flex-grow bg-white">{children}</main>
      <Footer />
    </>
  );
}

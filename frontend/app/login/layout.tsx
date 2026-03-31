import AdminFooter from "@/components/AdminFooter";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1">{children}</main>
      <AdminFooter />
    </>
  );
}

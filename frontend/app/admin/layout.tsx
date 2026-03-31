import AdminHeader from "@/components/AdminHeader";
import AdminFooter from "@/components/AdminFooter";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminHeader />
      <div className="min-h-screen flex flex-col md:ml-64">
        <main className="flex-1 bg-white">{children}</main>
        <AdminFooter />
      </div>
    </>
  );
}

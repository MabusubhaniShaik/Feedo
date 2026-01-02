// app/(dashboard)/layout.tsx
import HeaderComponent from "@/components/HeaderComponent";
import MenuComponent from "@/components/MenuComponent";
import AuthGuard from "@/components/AuthGuard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard mode="protected">
      <div className="flex h-screen">
        <div className="hidden md:block w-64">
          <MenuComponent />
        </div>

        <div className="flex-1 flex flex-col">
          <HeaderComponent />
          <main className="flex-1 overflow-auto p-2">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}

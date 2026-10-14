// app/(mainlayout)/layout.tsx
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
      <div className="flex h-screen overflow-hidden bg-background">
        <MenuComponent />

        <div className="flex min-w-0 flex-1 flex-col">
          <HeaderComponent />
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

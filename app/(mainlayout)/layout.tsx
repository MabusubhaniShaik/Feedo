// app/(dashboard)/layout.tsx
import HeaderComponent from "@/components/HeaderComponent";
import MenuComponent from "@/components/MenuComponent";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <MenuComponent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <HeaderComponent />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;

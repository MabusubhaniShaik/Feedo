import AuthGuard from "@/components/AuthGuard";
import Image from "next/image";
import LogoImg from "@/public/assests/FeedO_logo.png";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard mode="auth">
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left Section with Logo */}
        <div className="hidden md:flex bg-black text-white flex-col items-center justify-center px-12">
          <div className="mb-8">
            <Image
              src={LogoImg}
              alt="Feedo Logo"
              width={500}
              height={300}
              className="rounded-lg"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">Feedo</h1>
          <p className="text-lg text-gray-300 max-w-md text-center">
            Collect feedback effortlessly, analyze insights instantly, and
            improve your product experience with confidence.
          </p>
        </div>

        {/* Right Section - Login Form */}
        <div className="flex items-center justify-center bg-gray-50 px-6">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default AuthLayout;

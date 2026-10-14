import AuthGuard from "@/components/AuthGuard";
import Spotlight from "@/components/Spotlight";
import Image from "next/image";
import LogoImg from "@/app/assets/FeedO_logo.png";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard mode="auth">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
        {/* Left: ink brand panel with champagne spotlight */}
        <div className="relative hidden overflow-hidden bg-sidebar md:flex md:flex-col md:items-center md:justify-center md:px-12">
          <Spotlight />

          <div className="relative z-10 mb-8 flex flex-col items-center">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-8 rounded-full opacity-60 blur-2xl"
                style={{
                  background:
                    "radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 70%)",
                }}
              />
              <Image
                src={LogoImg}
                alt="Feedo Logo"
                width={360}
                height={220}
                className="relative rounded-lg"
                priority
              />
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="gold-text text-5xl font-semibold tracking-wide">
              Feedo
            </h1>
            <div className="mt-4 h-px w-40 gold-rule" />
            <p className="mt-5 max-w-md font-sans text-base leading-relaxed text-muted-foreground">
              Collect feedback effortlessly, analyze insights instantly, and
              improve your product experience with confidence.
            </p>
            <p className="mt-10 text-[11px] uppercase tracking-[0.35em] text-muted-foreground/70">
              Feedback Suite · Est. 2026
            </p>
          </div>
        </div>

        {/* Right: form surface */}
        <div className="flex items-center justify-center bg-background px-6 py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default AuthLayout;

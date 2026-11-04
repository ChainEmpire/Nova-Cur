import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import { Buffer } from "buffer";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LandingNavbar from "./components/landing/Navbar";
import LandingFooter from "./components/landing/Footer";
import BackToTopButton from "./components/landing/BackToTopButton";
import { NetworkGuard } from "./components/NetworkGuard";
import { isLoggedIn, redirectIfAuthenticated } from "./utils/clientAuth";
import { isAdminLoggedIn } from "./admin/api";

type AppProps = {
  children?: ReactNode;
};

const landingRoutes = ["/", "/trading", "/about"];
const protectedRoutes = ["/swap", "/overview", "/liquidity", "/coins", "/blog", "/nft"];
const adminPublicRoutes = ["/admin/login"];

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

const Layout = ({ children }: { children: ReactNode }) => (
  <>
    <Header />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

const LandingLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-nova-bg text-nova-text">
    <LandingNavbar />
    <main>{children}</main>
    <LandingFooter />
    <BackToTopButton />
  </div>
);

function App({ children }: AppProps) {
  const router = useRouter();
  const isLandingRoute = landingRoutes.includes(router.pathname);
  const isAdminPath = isAdminRoute(router.pathname);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      if (!(window as any).Buffer) {
        (window as any).Buffer = Buffer;
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleRouteChangeComplete = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router.events]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isAdminPath) {
      if (router.pathname === "/admin/login") {
        if (isAdminLoggedIn()) {
          router.push("/admin");
        }
        return;
      }

      if (!adminPublicRoutes.includes(router.pathname) && !isAdminLoggedIn()) {
        router.push("/admin/login");
      }
      return;
    }

    if (router.pathname === "/") {
      void redirectIfAuthenticated(router);
      return;
    }

    if (router.pathname === "/login") {
      if (isLoggedIn()) {
        router.push("/swap");
      }
      return;
    }

    const shouldProtect = protectedRoutes.includes(router.pathname);
    if (shouldProtect && !isLoggedIn()) {
      router.push("/login");
    }
  }, [router.pathname, isAdminPath]);

  const content = isAdminPath ? (
    children
  ) : isLandingRoute ? (
    <LandingLayout>{children}</LandingLayout>
  ) : (
    <Layout>{children}</Layout>
  );

  return (
    <>
      {!isAdminPath && <NetworkGuard />}
      <div className="relative w-full overflow-x-hidden min-h-screen" id="dashboard">
        {content}
      </div>
      <ToastContainer />
    </>
  );
}

export default App;

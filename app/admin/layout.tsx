"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { signOut } from "firebase/auth";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ADMIN_ROUTES } from "@/config/sidebarRoutes";

const mobileNavItems = [
  { label: "Overview", icon: "dashboard", path: "/admin", exact: true },
  { label: "Students", icon: "group", path: "/admin/students" },
  { label: "Bookings", icon: "event_available", path: "/demo-booking" },
  { label: "Settings", icon: "settings", path: "/admin/settings" }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [logoUrl, setLogoUrl] = useState("");
  const [dbUser, setDbUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const snap = await getDoc(doc(db, "institute_settings", "global"));
        if (snap.exists() && snap.data().logo_url) {
          setLogoUrl(snap.data().logo_url);
        }
      } catch (err) {
        console.error("Failed to fetch logo", err);
      }
    };
    fetchLogo();

    const fetchPendingBookings = async () => {
      try {
        const { query, collection, where, onSnapshot } = await import("firebase/firestore");
        const q = query(collection(db, "demoBookings"), where("status", "==", "pending"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          setPendingBookings(snapshot.docs.length);
        });
        return unsubscribe;
      } catch (err) {
        console.error("Failed to fetch pending bookings", err);
      }
    };

    let unsubBookings: any = null;
    fetchPendingBookings().then(unsub => unsubBookings = unsub);

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setDbUser({ id: userDoc.id, ...userDoc.data() });
        } else {
          setDbUser({ name: user.displayName, email: user.email, profileImage: user.photoURL });
        }
      } else {
        setDbUser(null);
      }
    });
    return () => {
      unsubscribeAuth();
      if (unsubBookings) unsubBookings();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const getLinkClass = (path: string) => {
    // exact match for /admin, startsWith for others
    const isActive = path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group font-medium ${isActive
      ? "bg-emerald-700 text-white shadow-md"
      : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
      }`;
  };

  const getIconClass = (path: string) => {
    const isActive = path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);
    return `material-symbols-outlined text-[22px] ${isActive ? "text-white" : "group-hover:text-emerald-700 transition-colors"
      }`;
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body { font-family: 'Inter', sans-serif; }
            .glass-nav {
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
            }
            .custom-scrollbar::-webkit-scrollbar {
                width: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #e2e8f0;
                border-radius: 10px;
            }
        `,
        }}
      />
      <div className="flex h-[100dvh] overflow-hidden pt-4 max-md:pt-0">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-[80%] max-w-sm
          bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-out
          lg:hidden flex flex-col
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="p-6 flex justify-between items-center border-b border-slate-100">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Institute Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
              ) : (
                <Image src="/images/hero/logo.jpg" alt="Logo" width={40} height={40} className="rounded-md object-cover shadow-sm" />
              )}
              <div>
                <h1 className="text-lg font-bold leading-none">SIFL</h1>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">
                  Language Institute
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="pb-4">
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Main Menu
              </p>
              {ADMIN_ROUTES.map((route) => (
                <Link
                  key={route.path}
                  className={getLinkClass(route.path)}
                  href={route.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={getIconClass(route.path)}>{route.icon}</span>
                  <span className="text-sm">{route.name}</span>
                </Link>
              ))}
            </div>
            <div className="pb-4 pt-4 border-t border-slate-100">
              <Link
                className={getLinkClass("/admin/settings")}
                href="/admin/settings"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={getIconClass("/admin/settings")}>settings</span>
                <span className="text-sm">Settings</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white hidden lg:flex flex-col">
          <div className="p-6 flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Institute Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
            ) : (
              <Image src="/images/hero/logo.jpg" alt="Logo" width={40} height={40} className="rounded-md object-cover shadow-sm" />
            )}
            <div>
              <h1 className="text-lg font-bold leading-none">SIFL</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-1">
                Language Institute
              </p>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="pb-4">
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Main Menu
              </p>
              {ADMIN_ROUTES.map((route) => (
                <Link
                  key={route.path}
                  className={getLinkClass(route.path)}
                  href={route.path}
                >
                  <span className={getIconClass(route.path)}>
                    {route.icon}
                  </span>
                  <span className="text-sm">{route.name}</span>
                </Link>
              ))}
            </div>
            <div className="pb-4 pt-4 border-t border-slate-100">
              <Link
                className={getLinkClass("/admin/settings")}
                href="/admin/settings"
              >
                <span className={getIconClass("/admin/settings")}>
                  settings
                </span>
                <span className="text-sm">Settings</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-hidden">
          {/* Top Navbar */}
          <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 glass-nav sticky top-0 z-10 w-full max-md:px-4 max-md:bg-white/70 max-md:backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
              <h2 className="text-lg font-bold">Admin Portal</h2>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/admin/schedule" className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-slate-600">notifications</span>
                {pendingBookings > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center size-4 bg-red-500 text-white text-[10px] font-bold rounded-full border border-white">
                    {pendingBookings}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200 relative">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none text-gray-800">
                    {dbUser?.name || "Admin User"}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">Administrator</p>
                </div>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="size-9 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center cursor-pointer hover:scale-105 transition"
                >
                  {dbUser?.profileImage ? (
                    <img src={dbUser.profileImage} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400">person</span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                    <Link
                      href="/admin/settings"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-sm text-slate-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm text-red-600 transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Child Page Rendering */}
          <div className="flex-1 overflow-y-auto p-4 max-md:pb-24 md:p-8 custom-scrollbar relative">
            {children}
          </div>
        </main>
        <MobileBottomNav items={mobileNavItems} />
      </div>
    </>
  );
}
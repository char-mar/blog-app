import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const publicRoutes = [
  { name: "Home", link: "/" },
  { name: "Blog", link: "/blog" },
  { name: "About", link: "/about" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `font-medium transition-colors hover:text-red-400 ${
    isActive ? "text-red-400" : "text-white"
  }`;

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      setMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <header className="w-full bg-gray-800">
      <nav
        className="container mx-auto flex min-h-16 max-w-7xl items-center justify-between px-6 py-3"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <Link
          to="/"
          className="text-xl font-bold text-white"
          aria-label="Go to homepage"
        >
          LOGO <span className="text-red-400">Name</span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="text-white md:hidden"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        {/* Navigation links */}
        <div
          className={`${menuOpen ? "flex" : "hidden"} absolute left-0 top-16 z-50 w-full flex-col gap-5 bg-gray-800 p-6 md:static md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:p-0`}
        >
          {publicRoutes.map((route) => (
            <NavLink
              key={route.link}
              to={route.link}
              end={route.link === "/"}
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              {route.name}
            </NavLink>
          ))}

          {!isLoading &&
            (user ? (
              <>
                <NavLink
                  to="/me"
                  className={navLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  My Account
                </NavLink>

                <Link
                  to="/posts/create"
                  className="font-medium text-white transition-colors hover:text-red-400"
                  onClick={() => setMenuOpen(false)}
                >
                  Create Post
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left font-medium text-white transition-colors hover:text-red-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={navLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </NavLink>

                <Link
                  to="/register"
                  className="rounded-md bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            ))}
        </div>
      </nav>
    </header>
  );
}

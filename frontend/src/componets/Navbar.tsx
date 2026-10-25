import React from "react";
import { Link, NavLink } from "react-router-dom";

const routes = [
  { name: "Home", link: "/" },
  { name: "Blog", link: "/blog" },
  { name: "About", link: "/about" },
];

export default function Navbar() {
  return (
    <header className="w-full bg-gray-800">
      <nav
        className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6"
        aria-label="Main navigation"
      >
        <Link
          to={"/"}
          className="text-xl font-bold text-white"
          aria-label="Brand logo and brand name"
        >
          LOGO <span>Name</span>
        </Link>

        <div className="flex items-center gap-6">
          {routes.map((route) => (
            <NavLink
              key={route.link}
              to={route.link}
              end={route.link === "/"}
              className={({ isActive }) =>
                `font-medium transition-colors hover:text-red-700 ${isActive ? "text-red-700" : "text-white"}`
              }
            >
              {route.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

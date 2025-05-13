import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Products", href: "/dashboard/products" },
  { name: "Categories", href: "/dashboard/categories" },
  { name: "Ingredients", href: "/dashboard/ingredients" },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <Link href="/dashboard" className="flex ml-2 md:mr-24">
                <span className="self-center text-xl font-semibold sm:text-2xl">PIM System</span>
              </Link>
            </div>
            <div className="flex items-center">
              <UserButton afterSignOutUrl="/"/>
            </div>
          </div>
        </div>
      </nav>

      <aside className="fixed left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200">
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
          <ul className="space-y-2 font-medium">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
                >
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="p-4 sm:ml-64 pt-20">
        <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

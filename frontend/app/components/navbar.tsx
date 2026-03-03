import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const navItems: {
  label: string;
  href: string;
  hasDropdown: boolean;
  dropdownItems?: string[];
}[] = [
  {
    label: "Apply",
    href: "/about",
    hasDropdown: false,
    //dropdownItems: ["Our Story", "FAQ", "Contact"],
  },
];

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-[#faf9f6]">
      <nav className="flex items-center justify-between bg-[#faf9f6] font-extrabold  px-8 py-5 lg:px-10">
        <Link to="/" className="font-display">
          Grist Club
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.hasDropdown && item.dropdownItems ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
                        {item.label}
                        <span className="text-xs text-gray-400">+</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      sideOffset={8}
                      className="min-w-45 bg-[#faf9f6]"
                    >
                      {item.dropdownItems.map((subItem) => (
                        <DropdownMenuItem key={subItem} asChild>
                          <Link
                            to="#"
                            className="cursor-pointer text-sm font-medium text-gray-700 hover:bg-primary! hover:text-white!"
                          >
                            {subItem}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    to={item.href}
                    className="flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <Button variant="default" size="sm" className="bg-primary!" asChild>
            <Link to="/m" className="text-sm!">
              Log in
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

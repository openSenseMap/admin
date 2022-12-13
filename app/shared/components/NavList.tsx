import { NavLink } from "@remix-run/react";

export default function NavList() {
  // This styling will be applied to a <NavLink> when the
  // route that it links to is currently selected.
  const activeClassName = "border-b-2 border-b-indigo-500";
  return (
    <nav className="h-full">
      <ul className="flex flex-row h-full">
        <NavLink
          to="/users"
          className={({ isActive}) => isActive ? 'border-b-2 border-b-indigo-500' : 'hover:border-b-2 hover:border-b-gray-200 hover:bg-gray-100'}
        >
          <div className="p-4">
            Users
          </div>
        </NavLink>
        <NavLink
          to="/devices"
          className={({ isActive}) => isActive ? 'border-b-2 border-b-indigo-500' : 'hover:border-b-2 hover:border-b-gray-200 hover:bg-gray-100'}
        >
          <div className="p-4">
            Boxes
          </div>
        </NavLink>
      </ul>
    </nav>
  );
}
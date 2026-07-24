import {
  House,
  Compass,
  Bell,
  MessageCircle,
  Bookmark,
  HeartHandshake,
  User,
  Settings,
  CirclePlus,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    name: "Home",
    icon: House,
    path: "/",
  },
  {
    name: "Explore",
    icon: Compass,
    path: "/explore",
  },
  {
    name: "Notifications",
    icon: Bell,
    path: "/notifications",
    badge: 12,
  },
  {
    name: "Messages",
    icon: MessageCircle,
    path: "/messages",
    badge: 5,
  },
  {
    name: "Bookmarks",
    icon: Bookmark,
    path: "/bookmarks",
  },
  {
    name: "Saved Causes",
    icon: HeartHandshake,
    path: "/saved",
  },
  {
    name: "Profile",
    icon: User,
    path: "/profile",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

const Sidebar = () => {
  return (
    <aside className="h-screen bg-white border-r border-gray-100 shadow-[4px_0_12px_rgba(0,0,0,0.06)] flex flex-col px-5 py-6">
      <div className="flex items-center gap-3">
        <img
          src="/logos/ayuda-logo.png"
          alt="Ayuda Logo"
          className="w-14 h-14 object-contain"
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Ayuda
          </h1>
          <p className="text-xs text-slate-500">Help. Hope. Humanity.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-xl transition-all mb-2
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <div className="flex items-center gap-6">
                <Icon size={22} />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Button */}

      <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-medium transition">
        <CirclePlus size={20} />
        Post a Need
      </button>

      {/* User */}

      <div className="mt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/100?img=12"
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />

          <div>
            <h3 className="font-semibold">Sai Prithvi</h3>
            <p className="text-sm text-gray-500">@saiprithvi</p>
          </div>
        </div>

        <button className="text-gray-500 text-xl">⋮</button>
      </div>
    </aside>
  );
};

export default Sidebar;

import { Search, Bell, MessageCircle, ChevronDown } from "lucide-react";

const Header = () => {
  return (
    <header className="h-20 bg-white border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] px-8 flex items-center justify-between">
      {/* Search */}

      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search for causes, organizations, people..."
            className="w-full h-12 rounded-2xl bg-gray-100 border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none pl-12 pr-4 transition"
          />
        </div>
      </div>

      {/* Right */}

      <div className="flex items-center gap-6 ml-8">
        {/* Notifications */}

        <button className="relative hover:text-blue-600 transition">
          <Bell size={24} />

          <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
            12
          </span>
        </button>

        {/* Messages */}

        <button className="relative hover:text-blue-600 transition">
          <MessageCircle size={24} />

          <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
            5
          </span>
        </button>

        {/* User */}

        <button className="flex items-center gap-3 hover:bg-gray-100 rounded-xl px-2 py-2 transition">
          <img
            src="https://i.pravatar.cc/100?img=12"
            alt="Profile"
            className="w-11 h-11 rounded-full object-cover"
          />

          <div className="text-left hidden md:block">
            <h3 className="font-semibold text-sm text-gray-900">Sai Prithvi</h3>

            <p className="text-xs text-gray-500">Volunteer</p>
          </div>

          <ChevronDown size={18} className="text-gray-500" />
        </button>
      </div>
    </header>
  );
};

export default Header;

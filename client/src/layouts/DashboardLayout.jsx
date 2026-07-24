import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";

const DashboardLayout = () => {
  return (
    <div className="w-full h-screen overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-1/6 h-screen bg-white shadow-[4px_0_12px_rgba(0,0,0,0.08)] z-20">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="w-5/6 h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="w-full h-fit bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] z-10">
          <Header />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto py-6 scrollbar-none">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

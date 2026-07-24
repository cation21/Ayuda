import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";

const DashboardLayout = () => {
  return (
    <div className="w-full h-screen overflow-hidden flex flex-row">
      <div className="w-1/6 h-screen bg-red-400">
        <Sidebar />
      </div>

      <div className="w-5/6 h-screen flex flex-col">
        <div className="w-full h-1/12 bg-pink-200">
          <Header />
        </div>
        <div className="w-full h-11/12 bg-amber-200">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

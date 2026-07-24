import { Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Dashboard/Home";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;

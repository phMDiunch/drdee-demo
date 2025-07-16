import { Routes, Route } from "react-router-dom";
import ServiceManagementPage from "../pages/ServiceManagementPage";
import EmployeeManagementPage from "../pages/EmployeeManagementPage";
import CustomerManagementPage from "../pages/CustomerManagementPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/services" element={<ServiceManagementPage />} />
      <Route path="/employees" element={<EmployeeManagementPage />} />
      <Route path="/customers" element={<CustomerManagementPage />} />
      {/* Các route khác sẽ thêm vào đây */}
    </Routes>
  );
};

export default AppRoutes;

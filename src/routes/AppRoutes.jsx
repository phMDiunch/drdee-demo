import { Routes, Route } from 'react-router-dom';
import ServiceManagementPage from '../pages/ServiceManagementPage';
import EmployeeManagementPage from '../pages/EmployeeManagementPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/services" element={<ServiceManagementPage />} />
            <Route path="/employees" element={<EmployeeManagementPage />} />
            {/* Các route khác sẽ thêm vào đây */}
        </Routes>
    );
};

export default AppRoutes;
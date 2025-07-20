// src/App.jsx
import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDataStore } from './stores/dataStore';

function App() {
  const fetchInitialData = useDataStore((state) => state.fetchInitialData);
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);
  return (
    <div>
      {/* Các component layout chung như Menu, Header sẽ được thêm vào đây sau */}
      <AppRoutes />

      {/* ToastContainer để hiển thị thông báo */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
      // hideProgressBar={false}
      // newestOnTop={false}
      // closeOnClick
      // rtl={false}
      // pauseOnFocusLoss
      // draggable
      // pauseOnHover
      // theme="light"
      />
    </div>
  );
}

export default App;
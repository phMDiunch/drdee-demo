// src/stores/dataStore.js
import { create } from "zustand";
import { getServices } from "../services/service";
import { getEmployees } from "../services/employeeService";

export const useDataStore = create((set) => ({
  services: [],
  employees: [],
  doctors: [],
  loading: true,

  // Hành động (action) để tải dữ liệu ban đầu
  fetchInitialData: async () => {
    try {
      set({ loading: true });
      const [servicesData, employeesData] = await Promise.all([
        getServices(),
        getEmployees(),
      ]);

      const doctorsData = employeesData.filter((e) =>
        e.position?.toLowerCase().includes("bác sĩ")
      );

      set({
        services: servicesData,
        employees: employeesData,
        doctors: doctorsData,
        loading: false,
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu ban đầu:", error);
      set({ loading: false });
    }
  },
}));

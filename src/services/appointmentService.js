import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
} from "firebase/firestore";

const appointmentCollectionRef = collection(db, "appointments");

/**
 * Lấy tất cả lịch hẹn.
 * @returns {Promise<Array>} Mảng các lịch hẹn.
 */
export const getAppointments = async () => {
  const q = query(appointmentCollectionRef);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    // Chuyển đổi Timestamp sang Date object để FullCalendar hiểu
    start: doc.data().appointmentDateTime.toDate(),
    end: doc.data().appointmentDateTime.toDate(), // Có thể điều chỉnh nếu có thời lượng
    title: doc.data().customerName, // Tiêu đề hiển thị trên lịch
  }));
};

/**
 * Thêm một lịch hẹn mới.
 * @param {object} appointmentData - Dữ liệu lịch hẹn.
 * @returns {Promise<string>} ID của lịch hẹn vừa tạo.
 */
export const addAppointment = async (appointmentData) => {
  const docRef = await addDoc(appointmentCollectionRef, appointmentData);
  return docRef.id;
};

/**
 * Cập nhật một lịch hẹn.
 * @param {string} id - ID của lịch hẹn.
 * @param {object} updatedData - Dữ liệu mới.
 */
export const updateAppointment = async (id, updatedData) => {
  const apptDoc = doc(db, "appointments", id);
  await updateDoc(apptDoc, updatedData);
};

/**
 * Xóa một lịch hẹn.
 * @param {string} id - ID của lịch hẹn.
 */
export const deleteAppointment = async (id) => {
  const apptDoc = doc(db, "appointments", id);
  await deleteDoc(apptDoc);
};

import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

const planCollectionRef = collection(db, "treatmentPlans");

export const getPlansByCustomerId = async (customerId) => {
  const q = query(planCollectionRef, where("customerId", "==", customerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Thêm một Kế hoạch Điều trị mới.
 * @param {object} planData - Dữ liệu kế hoạch.
 * @returns {Promise<string>} ID của kế hoạch vừa tạo.
 */
export const addPlan = async (planData) => {
  const docRef = await addDoc(planCollectionRef, planData);
  return docRef.id;
};

/**
 * Cập nhật một Kế hoạch Điều trị.
 * @param {string} id - ID của kế hoạch.
 * @param {object} updatedData - Dữ liệu mới.
 */
export const updatePlan = async (id, updatedData) => {
  if (!id) throw new Error("ID của kế hoạch điều trị là bắt buộc để cập nhật.");
  const planDoc = doc(db, "treatmentPlans", id);
  await updateDoc(planDoc, updatedData);
};

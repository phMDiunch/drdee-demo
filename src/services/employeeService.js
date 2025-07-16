import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const employeeCollectionRef = collection(db, "employees");

// READ
export const getEmployees = async () => {
  const data = await getDocs(employeeCollectionRef);
  // Thêm ID của document vào object data
  return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

// CREATE
export const addEmployee = async (newEmployee) => {
  await addDoc(employeeCollectionRef, newEmployee);
};

// UPDATE
export const updateEmployee = async (id, updatedEmployee) => {
  const employeeDoc = doc(db, "employees", id);
  await updateDoc(employeeDoc, updatedEmployee);
};

// DELETE
export const deleteEmployee = async (id) => {
  const employeeDoc = doc(db, "employees", id);
  await deleteDoc(employeeDoc);
};

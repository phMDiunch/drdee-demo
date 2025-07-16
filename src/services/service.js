import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const serviceCollectionRef = collection(db, "services");

// READ
export const getServices = async () => {
  const data = await getDocs(serviceCollectionRef);
  return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

// CREATE
export const addService = async (newService) => {
  await addDoc(serviceCollectionRef, newService);
};

// UPDATE
export const updateService = async (id, updatedService) => {
  const serviceDoc = doc(db, "services", id);
  await updateDoc(serviceDoc, updatedService);
};

// DELETE
export const deleteService = async (id) => {
  const serviceDoc = doc(db, "services", id);
  await deleteDoc(serviceDoc);
};

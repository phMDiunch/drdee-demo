import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

const serviceCollectionRef = collection(db, "consultedServices");

export const getConsultedServicesByCustomerId = async (customerId) => {
  const q = query(serviceCollectionRef, where("customerId", "==", customerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addConsultedService = async (serviceData) => {
  const docRef = await addDoc(serviceCollectionRef, serviceData);
  return docRef.id;
};

export const updateConsultedService = async (id, updatedData) => {
  const serviceDoc = doc(db, "consultedServices", id);
  await updateDoc(serviceDoc, updatedData);
};

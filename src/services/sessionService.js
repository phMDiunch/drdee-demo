import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import dayjs from "dayjs";

const sessionCollectionRef = collection(db, "sessions");

export const getSessionsByCustomerId = async (customerId) => {
  const q = query(sessionCollectionRef, where("customerId", "==", customerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const addOrUpdateSession = async (sessionData) => {
  // Lấy customerId từ chính object dữ liệu được truyền vào
  const customerId = sessionData.customerId;
  if (!customerId) {
    throw new Error("Không tìm thấy customerId trong dữ liệu session.");
  }

  const dateString = dayjs(sessionData.sessionDate.toDate()).format(
    "YYYY-MM-DD"
  );
  const docId = `${customerId}_${dateString}`;
  const sessionRef = doc(collection(db, "sessions"), docId);

  const docSnap = await getDoc(sessionRef);
  let existingDetails = [];
  if (docSnap.exists()) {
    existingDetails = docSnap.data().treatmentDetails || [];
  }

  const updatedDetails = [...existingDetails, ...sessionData.treatmentDetails];

  await setDoc(
    sessionRef,
    {
      ...sessionData,
      treatmentDetails: updatedDetails,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

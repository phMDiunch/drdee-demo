// Tạo file mới: src/services/followUpService.js
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  getDocs,
  orderBy,
} from "firebase/firestore";

const followUpCollectionRef = collection(db, "followUpCalls");

// Lấy toàn bộ lịch sử để hiển thị
export const getFollowUpCalls = async () => {
  const q = query(followUpCollectionRef, orderBy("callDate", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Thêm một lần gọi (một phiếu chăm sóc)
export const addFollowUpCall = async (callData) => {
  return await addDoc(followUpCollectionRef, {
    ...callData,
    createdAt: Timestamp.now(),
  });
};

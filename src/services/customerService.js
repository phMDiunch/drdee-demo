import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  runTransaction,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const customerCollectionRef = collection(db, "customers");
const counterCollectionRef = collection(db, "counters");

/**
 * Lấy danh sách khách hàng, có thể lọc theo chi nhánh.
 * @param {string | null} clinicId - ID chi nhánh để lọc, hoặc null/undefined để lấy tất cả.
 * @returns {Promise<Array>} Mảng các khách hàng.
 */
export const getCustomers = async (clinicId = null) => {
  const q = clinicId
    ? query(customerCollectionRef, where("clinicId", "==", clinicId))
    : query(customerCollectionRef);

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

/**
 * Cập nhật thông tin khách hàng.
 * @param {string} id - ID của khách hàng cần cập nhật.
 * @param {object} updatedData - Dữ liệu mới.
 */
export const updateCustomer = async (id, updatedData) => {
  const customerDoc = doc(db, "customers", id);
  await updateDoc(customerDoc, updatedData);
};

/**
 * Xóa một khách hàng.
 * @param {string} id - ID của khách hàng cần xóa.
 */
export const deleteCustomer = async (id) => {
  const customerDoc = doc(db, "customers", id);
  await deleteDoc(customerDoc);
};

/**
 * Thêm khách hàng mới với mã tự động tạo trong một Transaction an toàn.
 * @param {object} customerData - Dữ liệu khách hàng chưa có mã.
 * @returns {Promise<string>} Mã khách hàng vừa được tạo.
 */
export const addCustomerWithAutoCode = async (customerData) => {
  if (!customerData.clinicId) {
    throw new Error("clinicId là bắt buộc để tạo mã khách hàng.");
  }

  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const prefix = `${customerData.clinicId}-${year}${month}`; // Ví dụ: MK-2507

  // Tham chiếu đến document dùng để đếm
  const counterRef = doc(counterCollectionRef, prefix);

  try {
    // Chạy transaction
    const finalCode = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      let newSequence = 1;
      if (counterDoc.exists()) {
        newSequence = counterDoc.data().sequence + 1;
      }

      const sequenceString = newSequence.toString().padStart(3, "0");
      const generatedCode = `${prefix}-${sequenceString}`;

      // Tạo một document mới cho khách hàng
      const newCustomerRef = doc(customerCollectionRef); // Tạo ref trước để có ID

      // Gán dữ liệu khách hàng mới với mã đã tạo
      const finalCustomerData = {
        ...customerData,
        customerCode: generatedCode,
      };

      // Ghi dữ liệu khách hàng và cập nhật số đếm trong cùng 1 transaction
      transaction.set(newCustomerRef, finalCustomerData);
      transaction.set(counterRef, { sequence: newSequence });

      return generatedCode; // Trả về mã cuối cùng
    });

    return finalCode; // Trả về mã khách hàng sau khi transaction thành công
  } catch (e) {
    console.error("Transaction thất bại: ", e);
    throw new Error("Không thể tạo khách hàng. Vui lòng thử lại.");
  }
};

export const getCustomerById = async (id) => {
  const customerDoc = doc(db, "customers", id);
  const docSnap = await getDoc(customerDoc);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    console.log("Không tìm thấy document với ID:", id);
    return null;
  }
};

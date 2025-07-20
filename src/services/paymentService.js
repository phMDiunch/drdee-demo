import { db } from "../firebase/config";
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  Timestamp,
  where,
} from "firebase/firestore";

const paymentCollectionRef = collection(db, "payments");
const serviceCollectionRef = collection(db, "consultedServices");
const counterCollectionRef = collection(db, "counters");

export const addPayment = async (paymentData) => {
  if (!paymentData.allocations || paymentData.allocations.length === 0) {
    throw new Error("Phiếu thu phải được phân bổ cho ít nhất một dịch vụ.");
  }

  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const prefix = `PT-${year}${month}`;
  const counterRef = doc(counterCollectionRef, prefix);

  await runTransaction(db, async (transaction) => {
    // --- GIAI ĐOẠN 1: ĐỌC TẤT CẢ DỮ LIỆU TRƯỚC ---

    // Đọc số đếm hiện tại
    const counterDoc = await transaction.get(counterRef);

    // Đọc tất cả các dịch vụ cần cập nhật công nợ
    const serviceRefs = paymentData.allocations.map((alloc) =>
      doc(serviceCollectionRef, alloc.serviceId)
    );
    const serviceDocs = await Promise.all(
      serviceRefs.map((ref) => transaction.get(ref))
    );

    // --- GIAI ĐOẠN 2: XỬ LÝ LOGIC VÀ TÍNH TOÁN (KHÔNG TƯƠNG TÁC DB) ---

    let newSequence = 1;
    if (counterDoc.exists()) {
      newSequence = counterDoc.data().sequence + 1;
    }
    const paymentNumber = `${prefix}-${newSequence
      .toString()
      .padStart(4, "0")}`;

    // --- GIAI ĐOẠN 3: GHI TẤT CẢ DỮ LIỆU ---

    // Ghi document phiếu thu mới
    const newPaymentRef = doc(paymentCollectionRef);
    transaction.set(newPaymentRef, {
      ...paymentData,
      paymentNumber: paymentNumber,
      createdAt: Timestamp.now(),
    });

    // Ghi (update) lại công nợ cho từng dịch vụ
    serviceDocs.forEach((serviceDoc, index) => {
      if (!serviceDoc.exists()) {
        throw new Error(
          `Không tìm thấy dịch vụ với ID: ${paymentData.allocations[index].serviceId}`
        );
      }
      const oldData = serviceDoc.data();
      const currentPaid = oldData.amountPaid || 0;
      const newAmountPaid = currentPaid + paymentData.allocations[index].amount;
      const newDebt = (oldData.finalPrice || 0) - newAmountPaid;

      transaction.update(serviceDoc.ref, {
        amountPaid: newAmountPaid,
        debt: newDebt,
      });
    });

    // Ghi lại số đếm mới
    transaction.set(counterRef, { sequence: newSequence });
  });
};

export const getPaymentsByCustomerId = async (customerId) => {
  const q = query(paymentCollectionRef, where("customerId", "==", customerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * Tự động tạo mã khách hàng khi một document mới được thêm vào collection 'customers'.
 * Mã có định dạng: [PREFIX]-[YYMM]-[SEQ]. Ví dụ: MK-2507-001
 */
exports.generateCustomerCode = functions
  .region("asia-southeast1") // Chọn region gần Việt Nam
  .firestore.document("customers/{customerId}")
  .onCreate(async (snap, context) => {
    const newData = snap.data();
    const customerId = context.params.customerId;

    // Lấy clinicId từ dữ liệu khách hàng mới
    const clinicId = newData.clinicId;
    if (!clinicId) {
      console.log("Không có clinicId, không thể tạo mã.");
      return null;
    }

    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");

    // Ví dụ: clinicId là "MK", "TDT", "DN"
    const prefix = `${clinicId}-${year}${month}`;

    // Dùng transaction để đảm bảo không bị race condition
    return db.runTransaction(async (transaction) => {
      // Document dùng để lưu số đếm của từng chi nhánh trong tháng
      const counterRef = db.collection("counters").doc(prefix);
      const counterDoc = await transaction.get(counterRef);

      let newSequence = 1;
      if (counterDoc.exists) {
        newSequence = counterDoc.data().sequence + 1;
      }

      // Cập nhật số đếm mới
      transaction.set(counterRef, { sequence: newSequence });

      // Tạo mã khách hàng hoàn chỉnh
      const finalCode = `${prefix}-${newSequence.toString().padStart(3, "0")}`;

      // Cập nhật lại document khách hàng với mã mới
      const customerRef = db.collection("customers").doc(customerId);
      transaction.update(customerRef, { customerCode: finalCode });

      console.log(`Đã tạo mã ${finalCode} cho khách hàng ${customerId}`);
      return null;
    });
  });

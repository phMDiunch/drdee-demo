/**
 * Dọn dẹp một đối tượng trước khi gửi lên Firestore.
 * Phiên bản này đã được nâng cấp để xử lý cả mảng services lồng nhau.
 * Chuyển đổi các giá trị `undefined` thành giá trị mặc định (chuỗi rỗng, số 0, hoặc mảng rỗng).
 * @param {object} data - Đối tượng dữ liệu đầu vào từ form.
 * @returns {object} - Đối tượng dữ liệu đã được làm sạch.
 */
export const cleanDataForFirestore = (data) => {
  const cleanedData = {};

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];

      // Xử lý mảng services lồng nhau
      if (key === "services" && Array.isArray(value)) {
        cleanedData[key] = value.map((serviceItem) => {
          if (typeof serviceItem !== "object" || serviceItem === null) {
            return serviceItem;
          }
          // Áp dụng logic dọn dẹp cho từng dịch vụ trong mảng
          const cleanedServiceItem = {};
          for (const serviceKey in serviceItem) {
            const serviceValue = serviceItem[serviceKey];
            cleanedServiceItem[serviceKey] =
              serviceValue === undefined ? "" : serviceValue;
          }
          return cleanedServiceItem;
        });
      }
      // Xử lý các trường thông thường
      else {
        cleanedData[key] = value === undefined ? "" : value;
      }
    }
  }
  return cleanedData;
};

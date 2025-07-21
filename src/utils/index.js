/**
 * Dọn dẹp một đối tượng trước khi gửi lên Firestore.
 * Phiên bản này có thể dọn dẹp các giá trị `undefined` ở cả cấp đầu tiên
 * và bên trong các mảng object lồng nhau (ví dụ: services, allocations, treatmentDetails).
 */
export const cleanDataForFirestore = (data) => {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  const cleanedData = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];

      if (value === undefined) {
        // Bỏ qua các trường undefined ở cấp đầu
        continue;
      }

      if (Array.isArray(value)) {
        cleanedData[key] = value.map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            !Array.isArray(item)
          ) {
            const cleanedItem = {};
            for (const itemKey in item) {
              const itemValue = item[itemKey];
              // Gán giá trị rỗng '' cho các trường undefined trong object của mảng
              cleanedItem[itemKey] = itemValue === undefined ? "" : itemValue;
            }
            return cleanedItem;
          }
          return item;
        });
      } else {
        cleanedData[key] = value;
      }
    }
  }
  return cleanedData;
};

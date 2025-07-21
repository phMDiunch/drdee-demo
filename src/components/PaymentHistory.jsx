import React, { useState } from "react";
import { Table, Typography, Spin, Button } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { Timestamp } from "firebase/firestore";

import { addPayment } from "../services/paymentService";
import { cleanDataForFirestore } from "../utils";
import PaymentForm from "./PaymentForm";

const { Text } = Typography;

const PaymentHistory = ({
  payments,
  loading,
  customer,
  services,
  reloadData,
}) => {
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  const handleSavePayment = async (paymentDataFromForm) => {
    try {
      const cleanedPaymentData = cleanDataForFirestore(paymentDataFromForm);
      const finalPaymentData = {
        ...cleanedPaymentData,
        paymentDate: Timestamp.fromDate(
          cleanedPaymentData.paymentDate.toDate()
        ),
        customerId: customer.id,
        customerName: customer.fullName,
        cashierId: "ID_CUA_LE_TAN_DANG_NHAP", // Sẽ thay thế sau
      };

      await addPayment(finalPaymentData);

      toast.success("Tạo phiếu thu thành công!");
      setIsPaymentModalVisible(false);
      reloadData(); // Gọi lại hàm loadData của trang cha
    } catch (error) {
      console.error("Lỗi khi tạo phiếu thu:", error);
      toast.error(error.message);
    }
  };

  const columns = [
    { title: "Số Phiếu", dataIndex: "paymentNumber", key: "paymentNumber" },
    {
      title: "Ngày thu",
      dataIndex: "paymentDate",
      render: (date) => (date ? dayjs(date.toDate()).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Tổng tiền",
      dataIndex: "amount",
      render: (val) => (
        <Text strong style={{ color: "green" }}>
          {new Intl.NumberFormat("vi-VN").format(val || 0)} đ
        </Text>
      ),
    },
    {
      title: "Hình thức",
      dataIndex: "methods",
      render: (methods) => (methods || []).map((m) => m.type).join(", "),
    },
    { title: "Ghi chú", dataIndex: "notes", key: "notes" },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => setIsPaymentModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        + Tạo Phiếu thu
      </Button>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Spin>

      {isPaymentModalVisible && (
        <PaymentForm
          visible={isPaymentModalVisible}
          onCancel={() => setIsPaymentModalVisible(false)}
          onSave={handleSavePayment}
          customer={customer}
          // Lọc và truyền các dịch vụ đã chốt và còn nợ
          servicesToPay={services.filter(
            (s) =>
              s.serviceStatus === "Đã chốt" &&
              (s.finalPrice || 0) - (s.amountPaid || 0) > 0
          )}
        />
      )}
    </div>
  );
};

export default PaymentHistory;

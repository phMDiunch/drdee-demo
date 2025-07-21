import React, { useState, useMemo } from "react";
import { Button, Table, Typography } from "antd";
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import { toast } from "react-toastify";
import { cleanDataForFirestore } from "../utils";
import { addOrUpdateSession } from "../services/sessionService";
import SessionForm from "./SessionForm";

const { Text } = Typography;

const SessionHistory = ({
  sessions,
  customerServices,
  reloadData,
  customer,
  employees,
}) => {
  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);

  // Hàm tra cứu tên nhân viên từ ID, có thể tái sử dụng
  const getEmployeeNameById = (id) => {
    if (!id) return "";
    const employee = employees.find((e) => e.id === id);
    return employee ? employee.fullName : "Không rõ";
  };

  const handleSaveSession = async (values) => {
    try {
      const cleanedValues = cleanDataForFirestore(values);
      const sessionData = {
        ...cleanedValues,
        sessionDate: Timestamp.fromDate(cleanedValues.sessionDate.toDate()),
        customerId: customer.id,
      };
      console.log("Session data to save:", sessionData);
      await addOrUpdateSession(sessionData);
      toast.success("Ghi nhận buổi điều trị thành công!");
      setIsSessionModalVisible(false);
      reloadData();
    } catch (error) {
      console.error("Lỗi khi thêm buổi điều trị:", error);
      toast.error("Lỗi khi ghi nhận buổi điều trị.");
    }
  };

  // --- Bảng con: Các cột cho chi tiết dịch vụ trong một buổi ---
  const detailColumns = [
    { title: "Dịch vụ", dataIndex: "serviceName", key: "serviceName" },
    { title: "Nội dung thực hiện", dataIndex: "notes", key: "notes" },
    {
      title: "Bác sĩ",
      dataIndex: "dentistId",
      key: "dentistId",
      render: (id) => getEmployeeNameById(id),
    },
    {
      title: "Trợ thủ 1",
      dataIndex: "assistant1Id",
      key: "assistant1Id",
      render: (id) => getEmployeeNameById(id),
    },
    {
      title: "Trợ thủ 2",
      dataIndex: "assistant2Id",
      key: "assistant2Id",
      render: (id) => getEmployeeNameById(id),
    },
    {
      title: "Kế hoạch buổi sau",
      dataIndex: "nextSessionNotes",
      key: "nextSessionNotes",
    },
  ];

  // --- Bảng chính: Các cột cho mỗi buổi điều trị (mỗi ngày) ---
  const sessionColumns = [
    {
      title: "Ngày điều trị",
      dataIndex: "sessionDate",
      key: "sessionDate",
      render: (date) => (date ? dayjs(date.toDate()).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Số công việc",
      dataIndex: "treatmentDetails",
      key: "detailsCount",
      render: (details) => `${details?.length || 0} công việc`,
    },
    // Thêm cột hiển thị các bác sĩ tham gia trong buổi đó nếu muốn
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={() => setIsSessionModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        + Thêm Buổi điều trị
      </Button>

      <Table
        columns={sessionColumns}
        dataSource={sessions}
        rowKey="id"
        expandable={{
          // Logic để render bảng con bên trong
          expandedRowRender: (record) => (
            <Table
              columns={detailColumns}
              dataSource={record.treatmentDetails}
              rowKey={(item) => item.consultedServiceId || Math.random()}
              pagination={false}
            />
          ),
          // Chỉ cho phép mở rộng nếu có chi tiết điều trị
          rowExpandable: (record) =>
            record.treatmentDetails && record.treatmentDetails.length > 0,
        }}
      />

      {isSessionModalVisible && (
        <SessionForm
          visible={isSessionModalVisible}
          onCancel={() => setIsSessionModalVisible(false)}
          onSave={handleSaveSession}
          customerServices={customerServices.filter(
            (s) => s.serviceStatus === "Đã chốt"
          )}
        />
      )}
    </div>
  );
};

export default SessionHistory;

import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Typography, Spin, Tag } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { getFollowUpCalls, addFollowUpCall } from "../services/followUpService";
import FollowUpForm from "../components/FollowUpForm";
import { Timestamp } from "firebase/firestore";
import { cleanDataForFirestore } from "../utils";

const { Title } = Typography;

const FollowUpPage = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getFollowUpCalls();
    setCalls(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (values) => {
    try {
      console.log("1. Dữ liệu thô nhận từ Form:", values);
      const cleanedValues = cleanDataForFirestore(values);
      console.log("2. Dữ liệu sau khi được dọn dẹp:", cleanedValues);
      const callData = {
        ...values,
        callDate: Timestamp.now(),
        treatmentDate: Timestamp.fromDate(cleanedValues.treatmentDate.toDate()),
      };
      console.log("3. Dữ liệu cuối cùng chuẩn bị gửi đi:", callData);

      await addFollowUpCall(callData);
      toast.success("Lưu chăm sóc thành công!");
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      console.error("4. LỖI BỊ BẮT KHI LƯU:", error);
      toast.error("Lỗi khi lưu.");
    }
  };

  const columns = [
    {
      title: "Ngày gọi",
      dataIndex: "callDate",
      render: (date) => (date ? dayjs(date.toDate()).format("DD/MM/YYYY") : ""),
      sorter: (a, b) => a.callDate.seconds - b.callDate.seconds,
    },
    { title: "Khách hàng", dataIndex: "customerName" },
    { title: "Kết quả", dataIndex: "outcome" },
    { title: "Ghi chú", dataIndex: "notes" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Lịch sử Chăm sóc Khách hàng</Title>
      <Button
        type="primary"
        onClick={() => setIsModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        + Thêm Chăm sóc mới
      </Button>
      <Spin spinning={loading}>
        <Table dataSource={calls} columns={columns} rowKey="id" />
      </Spin>
      {isModalVisible && (
        <FollowUpForm
          visible={isModalVisible}
          onSave={handleSave}
          onCancel={() => setIsModalVisible(false)}
        />
      )}
    </div>
  );
};

export default FollowUpPage;

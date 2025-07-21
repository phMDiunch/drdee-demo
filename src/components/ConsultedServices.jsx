import React, { useState } from "react";
import { Button, Table, Tag, Space, Popconfirm, Typography } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import { cleanDataForFirestore } from "../utils";
import {
  updateConsultedService,
  addConsultedService,
} from "../services/consultedService";
import ConsultedServiceForm from "./ConsultedServiceForm";

const { Text } = Typography;

const ConsultedServices = ({ customer, services, reloadData }) => {
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // ... (copy các hàm handle... từ file cũ của bạn vào đây)
  const handleAddNewService = () => {
    setEditingService(null);
    setIsViewMode(false);
    setIsServiceModalVisible(true);
  };
  const handleEditOrViewService = (service) => {
    setEditingService(service);
    setIsViewMode(service.serviceStatus === "Đã chốt");
    setIsServiceModalVisible(true);
  };
  const handleCancelServiceModal = () => {
    setIsServiceModalVisible(false);
    setEditingService(null);
    setIsViewMode(false);
  };
  const handleSaveService = async (values) => {
    const cleanedValues = cleanDataForFirestore(values);
    const serviceData = {
      ...cleanedValues,
      consultationDate: Timestamp.fromDate(
        cleanedValues.consultationDate.toDate()
      ),
      customerId: customer.id, // SỬA LỖI 2: Dùng customer.id từ props
      updatedAt: Timestamp.now(),
    };

    try {
      if (editingService) {
        await updateConsultedService(editingService.id, serviceData);
        toast.success("Cập nhật dịch vụ thành công!");
      } else {
        serviceData.createdAt = Timestamp.now();
        serviceData.serviceStatus = "Chưa chốt";
        await addConsultedService(serviceData);
        toast.success("Thêm dịch vụ tư vấn thành công!");
      }
      setIsServiceModalVisible(false);
      reloadData();
    } catch (error) {
      console.error("Lỗi khi lưu dịch vụ:", error);
      toast.error("Thao tác thất bại.");
    }
  };
  const handleConfirmService = async (serviceId) => {
    try {
      await updateConsultedService(serviceId, {
        serviceStatus: "Đã chốt",
        serviceConfirmDate: Timestamp.now(),
      });
      toast.success("Chốt dịch vụ thành công!");
      reloadData();
    } catch (error) {
      toast.error("Lỗi khi chốt dịch vụ.");
      console.error("Lỗi khi chốt dịch vụ:", error);
    }
  };

  const columns = [
    {
      title: "Ngày Tư vấn",
      dataIndex: "consultationDate",
      render: (date) => (date ? dayjs(date.toDate()).format("DD/MM/YYYY") : ""),
    },
    { title: "Tên Dịch vụ", dataIndex: ["denormalized", "tenDichVu"] },
    {
      title: "Thành tiền",
      dataIndex: "finalPrice",
      render: (val) => new Intl.NumberFormat("vi-VN").format(val || 0) + " đ",
    },
    {
      title: "Đã trả",
      dataIndex: "amountPaid",
      render: (val) => (
        <Text color="green">
          {new Intl.NumberFormat("vi-VN").format(val || 0)} đ
        </Text>
      ),
    },
    {
      title: "Còn nợ",
      key: "debt",
      render: (_, record) => {
        const debt = (record.finalPrice || 0) - (record.amountPaid || 0);
        return (
          <Text type="danger">
            {new Intl.NumberFormat("vi-VN").format(debt)} đ
          </Text>
        );
      },
    },
    {
      title: "Trạng thái DV",
      dataIndex: "serviceStatus",
      render: (status) => (
        <Tag color={status === "Đã chốt" ? "green" : "orange"}>{status}</Tag>
      ),
      filters: [
        { text: "Chưa chốt", value: "Chưa chốt" },
        { text: "Đã chốt", value: "Đã chốt" },
      ],
      onFilter: (value, record) => record.serviceStatus.indexOf(value) === 0,
    },
    {
      title: "Trạng thái Điều trị",
      dataIndex: "treatmentStatus",
      render: (status) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          {" "}
          {record.serviceStatus === "Đã chốt" ? (
            <Button
              size="small"
              onClick={() => handleEditOrViewService(record)}
            >
              Xem
            </Button>
          ) : (
            <>
              {" "}
              <Button
                size="small"
                onClick={() => handleEditOrViewService(record)}
              >
                Sửa
              </Button>{" "}
              <Popconfirm
                title="Chắc chắn chốt dịch vụ này?"
                onConfirm={() => handleConfirmService(record.id)}
                okText="Chốt"
                cancelText="Hủy"
              >
                <Button size="small" type="primary">
                  Chốt
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAddNewService}>
          + Thêm Dịch vụ Tư vấn
        </Button>
      </Space>
      <Table columns={columns} dataSource={services} rowKey="id" />

      {isServiceModalVisible && (
        <ConsultedServiceForm
          visible={isServiceModalVisible}
          onCancel={handleCancelServiceModal}
          onSave={handleSaveService}
          initialValues={editingService}
          isViewMode={isViewMode}
        />
      )}
    </div>
  );
};

export default ConsultedServices;

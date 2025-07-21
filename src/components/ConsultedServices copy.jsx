import React, { useState, useEffect, useCallback } from "react";
import { Button, Table, Tag, Space, Popconfirm, Spin, Typography } from "antd"; // Sửa lại import
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import { cleanDataForFirestore } from "../utils";
// Services & Components
import {
  getConsultedServicesByCustomerId,
  updateConsultedService,
  addConsultedService,
} from "../services/consultedService";
import { addPayment } from "../services/paymentService";
import { getSessionsByServiceId, addSession } from "../services/sessionService";
import ConsultedServiceForm from "./ConsultedServiceForm";
import PaymentForm from "./PaymentForm";
import SessionForm from "./SessionForm";

const { Text } = Typography;

const SessionList = ({ service }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionsByServiceId(service.id).then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, [service.id]);

  // const columns = [
  //   {
  //     title: "Ngày",
  //     dataIndex: "sessionDate",
  //     render: (date) => (date ? dayjs(date.toDate()).format("DD/MM/YYYY") : ""),
  //   },
  //   { title: "Nội dung thực hiện", dataIndex: "notes" },
  //   { title: "Kế hoạch buổi sau", dataIndex: "nextSessionNotes" },
  // ];

  return (
    <Table
      columns={columns}
      dataSource={sessions}
      rowKey="id"
      pagination={false}
      loading={loading}
    />
  );
};

const ConsultedServices = ({ customer }) => {
  const [consultedServices, setConsultedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  const handleAddSession = (service) => {
    setCurrentService(service);
    setIsSessionModalVisible(true);
  };

  // const handleSaveSession = async (values) => {
  //   try {
  //     const sessionData = {
  //       ...values,
  //       sessionDate: Timestamp.fromDate(values.sessionDate.toDate()),
  //       customerId: customer.id,
  //       consultedServiceId: currentService.id,
  //     };
  //     await addSession(sessionData);
  //     toast.success("Thêm buổi điều trị thành công!");
  //     setIsSessionModalVisible(false);
  //     loadServices(); // Tải lại để có thể cập nhật trạng thái
  //   } catch (error) {
  //     toast.error("Lỗi khi thêm buổi điều trị.");
  //   }
  // };

  const loadServices = useCallback(async () => {
    if (customer?.id) {
      setLoading(true);
      const servicesData = await getConsultedServicesByCustomerId(customer.id);
      setConsultedServices(servicesData);
      setLoading(false);
    }
  }, [customer?.id]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Xử lý khi nhấn nút "Sửa" hoặc "Xem"
  // const handleEditOrViewService = (service) => {
  //   setEditingService(service);
  //   setIsViewMode(service.serviceStatus === "Đã chốt");
  //   setIsServiceModalVisible(true);
  // };

  // const handleAddNewService = () => {
  //   setEditingService(null);
  //   setIsViewMode(false);
  //   setIsServiceModalVisible(true);
  // };

  // const handleCancelServiceModal = () => {
  //   setIsServiceModalVisible(false);
  //   setEditingService(null);
  //   setIsViewMode(false);
  // };

  // Hàm lưu dữ liệu từ form
  // const handleSaveService = async (values) => {
  //   const cleanedValues = cleanDataForFirestore(values);
  //   const serviceData = {
  //     ...cleanedValues,
  //     consultationDate: Timestamp.fromDate(
  //       cleanedValues.consultationDate.toDate()
  //     ),
  //     customerId: customer.id, // SỬA LỖI 2: Dùng customer.id từ props
  //     updatedAt: Timestamp.now(),
  //   };

  //   try {
  //     if (editingService) {
  //       await updateConsultedService(editingService.id, serviceData);
  //       toast.success("Cập nhật dịch vụ thành công!");
  //     } else {
  //       serviceData.createdAt = Timestamp.now();
  //       serviceData.serviceStatus = "Chưa chốt";
  //       await addConsultedService(serviceData);
  //       toast.success("Thêm dịch vụ tư vấn thành công!");
  //     }
  //     setIsServiceModalVisible(false);
  //     loadServices();
  //   } catch (error) {
  //     console.error("Lỗi khi lưu dịch vụ:", error);
  //     toast.error("Thao tác thất bại.");
  //   }
  // };

  // const handleConfirmService = async (serviceId) => {
  //   try {
  //     await updateConsultedService(serviceId, {
  //       serviceStatus: "Đã chốt",
  //       serviceConfirmDate: Timestamp.now(),
  //     });
  //     toast.success("Chốt dịch vụ thành công!");
  //     loadServices();
  //   } catch (error) {
  //     toast.error("Lỗi khi chốt dịch vụ.");
  //   }
  // };

  const handleOpenPaymentModal = () => {
    setIsPaymentModalVisible(true);
  };

  const handleSavePayment = async (paymentDataFromForm) => {
    try {
      const cleanedPaymentData = cleanDataForFirestore(paymentDataFromForm);
      const finalPaymentData = {
        ...cleanedPaymentData,
        paymentDate: Timestamp.fromDate(
          cleanedPaymentData.paymentDate.toDate()
        ),
        customerId: customer.id, // SỬA LỖI 2: Dùng customer.id từ props
        cashierId: "ID_CUA_LE_TAN_DANG_NHAP",
      };
      await addPayment(finalPaymentData);
      toast.success("Tạo phiếu thu thành công!");
      setIsPaymentModalVisible(false);
      loadServices();
    } catch (error) {
      console.error("Lỗi khi tạo phiếu thu:", error);
      toast.error(error.message);
    }
  };

  // const columns = [
  //   {
  //     title: "Ngày Tư vấn",
  //     dataIndex: "consultationDate",
  //     render: (date) => (date ? dayjs(date.toDate()).format("DD/MM/YYYY") : ""),
  //   },
  //   { title: "Tên Dịch vụ", dataIndex: ["denormalized", "tenDichVu"] },
  //   {
  //     title: "Thành tiền",
  //     dataIndex: "finalPrice",
  //     render: (val) => new Intl.NumberFormat("vi-VN").format(val || 0) + " đ",
  //   },
  //   {
  //     title: "Đã trả",
  //     dataIndex: "amountPaid",
  //     render: (val) => (
  //       <Text color="green">
  //         {new Intl.NumberFormat("vi-VN").format(val || 0)} đ
  //       </Text>
  //     ),
  //   },
  //   {
  //     title: "Còn nợ",
  //     key: "debt",
  //     render: (_, record) => {
  //       const debt = (record.finalPrice || 0) - (record.amountPaid || 0);
  //       return (
  //         <Text type="danger">
  //           {new Intl.NumberFormat("vi-VN").format(debt)} đ
  //         </Text>
  //       );
  //     },
  //   },
  //   {
  //     title: "Trạng thái DV",
  //     dataIndex: "serviceStatus",
  //     render: (status) => (
  //       <Tag color={status === "Đã chốt" ? "green" : "orange"}>{status}</Tag>
  //     ),
  //     filters: [
  //       { text: "Chưa chốt", value: "Chưa chốt" },
  //       { text: "Đã chốt", value: "Đã chốt" },
  //     ],
  //     onFilter: (value, record) => record.serviceStatus.indexOf(value) === 0,
  //   },
  //   {
  //     title: "Trạng thái Điều trị",
  //     dataIndex: "treatmentStatus",
  //     render: (status) => <Tag color="blue">{status}</Tag>,
  //   },
  //   {
  //     title: "Hành động",
  //     key: "action",
  //     render: (_, record) => (
  //       <Space>
  //         {" "}
  //         {record.serviceStatus === "Đã chốt" ? (
  //           <Button
  //             size="small"
  //             onClick={() => handleEditOrViewService(record)}
  //           >
  //             Xem
  //           </Button>
  //         ) : (
  //           <>
  //             {" "}
  //             <Button
  //               size="small"
  //               onClick={() => handleEditOrViewService(record)}
  //             >
  //               Sửa
  //             </Button>{" "}
  //             <Popconfirm
  //               title="Chắc chắn chốt dịch vụ này?"
  //               onConfirm={() => handleConfirmService(record.id)}
  //               okText="Chốt"
  //               cancelText="Hủy"
  //             >
  //               <Button size="small" type="primary">
  //                 Chốt
  //               </Button>
  //             </Popconfirm>
  //           </>
  //         )}
  //       </Space>
  //     ),
  //   },
  // ];

  if (loading) return <Spin size="large" />;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        {/* SỬA LỖI 3: Sửa lại cách gọi hàm trong onClick */}
        <Button type="primary" onClick={handleAddNewService}>
          + Thêm Dịch vụ Tư vấn
        </Button>
        <Button onClick={handleOpenPaymentModal}>+ Tạo Phiếu thu</Button>
      </Space>

      <Table
        loading={loading}
        columns={columns}
        dataSource={consultedServices}
        rowKey="id"
        expandable={{
          expandedRowRender: (record) => (
            <div>
              <Button
                size="small"
                style={{ marginBottom: 8 }}
                onClick={() => handleAddSession(record)}
              >
                + Thêm Buổi điều trị
              </Button>
              <SessionList service={record} />
            </div>
          ),
          rowExpandable: (record) => record.serviceStatus === "Đã chốt",
        }}
      />

      {isServiceModalVisible && (
        <ConsultedServiceForm
          visible={isServiceModalVisible}
          onCancel={handleCancelServiceModal}
          onSave={handleSaveService}
          initialValues={editingService}
          isViewMode={isViewMode}
        />
      )}

      {isPaymentModalVisible && (
        <PaymentForm
          visible={isPaymentModalVisible}
          onCancel={() => setIsPaymentModalVisible(false)}
          onSave={handleSavePayment}
          customer={customer}
          servicesToPay={consultedServices.filter(
            (s) =>
              s.serviceStatus === "Đã chốt" &&
              (s.finalPrice || 0) > (s.amountPaid || 0)
          )}
        />
      )}
      {isSessionModalVisible && (
        <SessionForm
          visible={isSessionModalVisible}
          onCancel={() => setIsSessionModalVisible(false)}
          onSave={handleSaveSession}
        />
      )}
    </div>
  );
};

export default ConsultedServices;

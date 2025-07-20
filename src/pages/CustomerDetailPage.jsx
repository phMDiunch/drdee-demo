import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Breadcrumb, Descriptions, Spin, Card, Button, Table, Tag, Space, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { Timestamp } from 'firebase/firestore';

// Service imports
import { getCustomerById } from '../services/customerService';
import { getConsultedServicesByCustomerId, updateConsultedService, addConsultedService } from '../services/consultedService';
import { addPayment } from '../services/paymentService';
import { cleanDataForFirestore } from '../utils';

// Component imports
import ConsultedServiceForm from '../components/ConsultedServiceForm';
import PaymentForm from '../components/PaymentForm';


const { Title, Text } = Typography;

const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [consultedServices, setConsultedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho modal 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const customerData = await getCustomerById(customerId);
      setCustomer(customerData);
      if (customerData) {
        const servicesData = await getConsultedServicesByCustomerId(customerId);
        setConsultedServices(servicesData);
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Xử lý khi nhấn nút "Sửa" hoặc "Xem"
  const handleEditOrViewService = (service) => {
    setEditingService(service);
    // Nếu dịch vụ đã chốt, bật chế độ chỉ xem
    setIsViewMode(service.serviceStatus === 'Đã chốt');
    setIsModalVisible(true);
  };

  const handleAddNewService = () => {
    setEditingService(null);
    setIsViewMode(false);
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingService(null);
    setIsViewMode(false);
  };

  // Hàm lưu dữ liệu từ form
  const handleSaveService = async (values) => {
    const cleanedValues = cleanDataForFirestore(values);
    const serviceData = {
      ...cleanedValues,
      consultationDate: Timestamp.fromDate(cleanedValues.consultationDate.toDate()),
      customerId: customerId,
      updatedAt: Timestamp.now(),
    };

    try {
      if (editingService) {
        await updateConsultedService(editingService.id, serviceData);
        toast.success("Cập nhật dịch vụ thành công!");
      } else {
        serviceData.createdAt = Timestamp.now();
        serviceData.serviceStatus = "Chưa chốt"; // Mặc định khi mới tạo
        await addConsultedService(serviceData);
        toast.success("Thêm dịch vụ tư vấn thành công!");
      }
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      console.error("Lỗi khi lưu dịch vụ:", error);
      toast.error("Thao tác thất bại.");
    }
  };

  // Hàm để "chốt" một dịch vụ
  const handleConfirmService = async (serviceId) => {
    try {
      await updateConsultedService(serviceId, {
        serviceStatus: "Đã chốt",
        serviceConfirmDate: Timestamp.now(),
      });
      toast.success("Chốt dịch vụ thành công!");
      loadData();
    } catch (error) {
      toast.error("Lỗi khi chốt dịch vụ.");
    }
  };

  const handleOpenPaymentModal = () => {
    setIsPaymentModalVisible(true);
  };

  const handleSavePayment = async (paymentDataFromForm) => {
    try {
      // GỌI HÀM DỌN DẸP DỮ LIỆU
      const cleanedPaymentData = cleanDataForFirestore(paymentDataFromForm);

      const finalPaymentData = {
        ...cleanedPaymentData,
        paymentDate: Timestamp.fromDate(cleanedPaymentData.paymentDate.toDate()),
        customerId: customerId,
        cashierId: "ID_CUA_LE_TAN_DANG_NHAP",
      };

      console.log("Dữ liệu Phiếu thu chuẩn bị lưu:", finalPaymentData);
      await addPayment(finalPaymentData);

      toast.success("Tạo phiếu thu thành công!");
      setIsPaymentModalVisible(false);
      loadData();
    } catch (error) {
      console.error("Lỗi khi tạo phiếu thu:", error);
      toast.error(error.message);
    }
  };

  const columns = [
    { title: 'Ngày Tư vấn', dataIndex: 'consultationDate', render: (date) => date ? dayjs(date.toDate()).format('DD/MM/YYYY') : '' },
    { title: 'Tên Dịch vụ', dataIndex: ['denormalized', 'tenDichVu'], key: 'name' }, // Giả sử dữ liệu sao chép nằm trong object denormalized
    { title: 'Thành tiền', dataIndex: 'finalPrice', render: (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ' },
    {
      title: 'Trạng thái DV',
      dataIndex: 'serviceStatus',
      render: (status) => <Tag color={status === 'Đã chốt' ? 'green' : 'orange'}>{status}</Tag>,
      // Thêm bộ lọc cho cột này
      filters: [{ text: 'Chưa chốt', value: 'Chưa chốt' }, { text: 'Đã chốt', value: 'Đã chốt' }],
      onFilter: (value, record) => record.serviceStatus.indexOf(value) === 0,
    },

    {
      title: 'Đã trả',
      dataIndex: 'amountPaid',
      render: (val) => <Text color="green">{new Intl.NumberFormat('vi-VN').format(val || 0)} đ</Text>
    },

    {
      title: 'Còn nợ',
      key: 'debt',
      render: (_, record) => {
        const debt = (record.finalPrice || 0) - (record.amountPaid || 0);
        return <Text type="danger">{new Intl.NumberFormat('vi-VN').format(debt)} đ</Text>
      }
    },
    {
      title: 'Trạng thái Điều trị',
      dataIndex: 'treatmentStatus',
      render: (status) => <Tag color="blue">{status}</Tag>
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.serviceStatus === 'Đã chốt' ? (
            <Button size="small" onClick={() => handleEditOrViewService(record)}>Xem</Button>
          ) : (
            <>
              <Button size="small" onClick={() => handleEditOrViewService(record)}>Sửa</Button>
              <Popconfirm title="Chắc chắn chốt dịch vụ này?" onConfirm={() => handleConfirmService(record.id)} okText="Chốt" cancelText="Hủy">
                <Button size="small" type="primary">Chốt</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ];

  if (loading) return <Spin size="large" />;

  return (
    <div style={{ padding: '24px' }}>
      {/* ... Breadcrumb, Title, Card Thông tin cá nhân giữ nguyên ... */}
      <Breadcrumb
        items={[
          { title: <Link to="/customers">Quản lý Khách hàng</Link> },
          { title: "Chi tiết khách hàng" },
        ]}
      />

      <Title level={2} style={{ margin: "16px 0" }}>
        Hồ sơ khách hàng: {customer.fullName}
      </Title>

      <Card title="Thông tin cá nhân" style={{ marginBottom: "24px" }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã KH">
            {customer.customerCode}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {customer.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {customer.dob
              ? dayjs(customer.dob.toDate()).format("DD/MM/YYYY")
              : ""}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {customer.gender}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {customer.address}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Lịch sử Dịch vụ & Điều trị">
        <Space>
          <Button type="primary" onClick={handleAddNewService}>+ Thêm Dịch vụ Tư vấn</Button>
          <Button onClick={handleOpenPaymentModal}>+ Tạo Phiếu thu</Button>
        </Space>

        <Table columns={columns} dataSource={consultedServices} rowKey="id" />

      </Card>

      {isModalVisible && (
        <ConsultedServiceForm
          visible={isModalVisible}
          onSave={handleSaveService}
          onCancel={handleCancelModal}
          initialValues={editingService}
          isViewMode={isViewMode}
        />
      )}
      {isPaymentModalVisible && (
        <PaymentForm
          visible={isPaymentModalVisible}
          onSave={handleSavePayment}
          onCancel={() => setIsPaymentModalVisible(false)}
          customer={customer}
          // Chỉ đưa các dịch vụ đã chốt và còn nợ vào form
          servicesToPay={consultedServices.filter(s => s.serviceStatus === 'Đã chốt' && (s.finalPrice || 0) > (s.amountPaid || 0))}
        />
      )}
    </div>
  );
};

export default CustomerDetailPage;
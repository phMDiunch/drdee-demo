import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Breadcrumb,
  Popconfirm,
  Row,
  Col,
  DatePicker,
  Spin,
} from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import {
  getCustomers,
  addCustomerWithAutoCode,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService";
import { cleanDataForFirestore } from "../utils";
import { GENDERS, CLINIC_PREFIXES } from "../constants";

const { Title } = Typography;

const CustomerManagementPage = () => {
  const [form] = Form.useForm();
  const [allCustomers, setAllCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setAllCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách khách hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allCustomers.filter(
      (cust) =>
        cust.fullName.toLowerCase().includes(searchTerm) ||
        cust.phone.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      toast.success("Xóa khách hàng thành công!");
      fetchCustomers();
    } catch (error) {
      toast.error("Lỗi khi xóa khách hàng!");
    }
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCustomer(record);
    const formValues = {
      ...record,
      dob: record.dob ? dayjs(record.dob.toDate()) : null,
    };
    form.setFieldsValue(formValues);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    if (isSaving) return;
    setIsModalVisible(false);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);

      if (editingCustomer) {
        const processedValues = {
          ...values,
          dob: values.dob ? Timestamp.fromDate(values.dob.toDate()) : null,
        };
        const cleanedValues = cleanDataForFirestore(processedValues);
        const customerData = { ...cleanedValues, updatedAt: Timestamp.now() };

        await updateCustomer(editingCustomer.id, customerData);
        toast.success("Cập nhật khách hàng thành công!");
      } else {
        const processedValues = {
          ...values,
          dob: values.dob ? Timestamp.fromDate(values.dob.toDate()) : null,
        };
        const cleanedValues = cleanDataForFirestore(processedValues);
        const customerData = {
          ...cleanedValues,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const newCode = await addCustomerWithAutoCode(customerData);
        toast.success(`Tạo thành công! Mã KH: ${newCode}`);
      }

      setIsSaving(false);
      setIsModalVisible(false);
      fetchCustomers();
    } catch (error) {
      console.error("Lỗi xử lý form khách hàng:", error);
      toast.error(error.message || "Thao tác thất bại.");
      setIsSaving(false);
    }
  };

  const columns = [
    {
      title: "Mã KH",
      dataIndex: "customerCode",
      key: "customerCode",
      width: 150,
      fixed: "left",
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
      render: (text, record) => (
        <Link to={`/customers/${record.id}`}>{text}</Link>
      ),
    },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone", width: 120 },
    { title: "Giới tính", dataIndex: "gender", key: "gender", width: 100 },
    { title: "Nguồn", dataIndex: "source", key: "source", width: 150 },
    {
      title: "Hành động",
      key: "action",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <a onClick={() => handleEdit(record)}>Sửa</a>
          <Popconfirm
            title="Chắc chắn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <a>Xóa</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Breadcrumb
        items={[{ title: "Trang chủ" }, { title: "Quản lý Khách hàng" }]}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "16px 0",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Danh sách Khách hàng
        </Title>
        <Space>
          <Input.Search
            placeholder="Tìm theo tên, SĐT..."
            onChange={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          <Button type="primary" onClick={handleAddNew}>
            Thêm khách hàng
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCustomers}
        rowKey="id"
        loading={loading}
        scroll={{ x: 900 }}
      />

      <Modal
        title={
          editingCustomer ? "Sửa thông tin Khách hàng" : "Thêm Khách hàng mới"
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={1000}
        confirmLoading={isSaving}
        okText={isSaving ? "Đang xử lý..." : "Lưu"}
        cancelButtonProps={{ disabled: isSaving }}
      >
        <Spin spinning={isSaving}>
          <Form form={form} layout="vertical">
            <Title level={4}>Thông tin nhận diện</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Mã Khách hàng">
                  <Input
                    disabled
                    placeholder={
                      editingCustomer
                        ? editingCustomer.customerCode
                        : "Mã sẽ được tạo tự động"
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="dob" label="Ngày sinh">
                  <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="gender" label="Giới tính">
                  <Select
                    options={GENDERS.map((g) => ({ label: g, value: g }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="occupation" label="Nghề nghiệp">
                  <Input />
                </Form.Item>
              </Col>{" "}
              {/* <-- BỔ SUNG --> */}
              <Col span={8}>
                <Form.Item name="guardianName" label="Người giám hộ (nếu có)">
                  <Input />
                </Form.Item>
              </Col>{" "}
              {/* <-- BỔ SUNG --> */}
            </Row>

            <Title level={4}>Thông tin liên hệ</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="email" label="Email">
                  <Input />
                </Form.Item>
              </Col>{" "}
              {/* <-- BỔ SUNG --> */}
              <Col span={8}>
                <Form.Item name="address" label="Địa chỉ (Số nhà, đường)">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="district" label="Quận/Huyện">
                  <Input />
                </Form.Item>
              </Col>{" "}
              {/* <-- BỔ SUNG --> */}
              <Col span={8}>
                <Form.Item name="city" label="Tỉnh/Thành phố">
                  <Input />
                </Form.Item>
              </Col>{" "}
              {/* <-- BỔ SUNG --> */}
            </Row>

            <Title level={4}>Thông tin khác</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="clinicId"
                  label="Chi nhánh"
                  rules={[{ required: true }]}
                >
                  <Select options={CLINIC_PREFIXES} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="source" label="Nguồn khách hàng">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="sourceNotes" label="Ghi chú nguồn">
                  <Input />
                </Form.Item>
              </Col>{" "}
              {/* <-- BỔ SUNG --> */}
              <Col span={24}>
                <Form.Item name="servicesOfInterest" label="Dịch vụ quan tâm">
                  <Input.TextArea placeholder="Ví dụ: Niềng răng, Tẩy trắng" />
                </Form.Item>
              </Col>{" "}
              {/* <-- BỔ SUNG --> */}
            </Row>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default CustomerManagementPage;

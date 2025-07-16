import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, Input, InputNumber, Space, Typography,
    Breadcrumb, Popconfirm, Select, Row, Col
} from 'antd';
import { toast } from 'react-toastify';
import { getServices, addService, updateService, deleteService } from '../services/service';
import { cleanDataForFirestore } from '../utils';
import { SERVICE_UNITS, SERVICE_CATEGORIES } from '../constants';

const { Title } = Typography;
const { Option } = Select;

const ServiceManagementPage = () => {
    const [form] = Form.useForm();
    // --- THAY ĐỔI STATE ---
    const [allServices, setAllServices] = useState([]); // State lưu trữ toàn bộ dịch vụ
    const [filteredServices, setFilteredServices] = useState([]); // State lưu dịch vụ đã lọc để hiển thị
    // --- KẾT THÚC THAY ĐỔI ---
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingService, setEditingService] = useState(null);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const data = await getServices();
            // --- CẬP NHẬT CẢ 2 STATE ---
            setAllServices(data); // Lưu toàn bộ dịch vụ vào allServices
            setFilteredServices(data);
            // --- KẾT THÚC CẬP NHẬT ---
        } catch (error) {
            toast.error("Lỗi khi tải danh sách dịch vụ!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    // --- HÀM TÌM KIẾM MỚI ---
    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm === '') {
            setFilteredServices(allServices);
        } else {
            const filtered = allServices.filter(service =>
                service.name.toLowerCase().includes(searchTerm)
            );
            setFilteredServices(filtered);
        }
    };
    // --- KẾT THÚC HÀM TÌM KIẾM ---

    const handleAddNew = () => {
        setEditingService(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingService(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteService(id);
            toast.success("Xóa dịch vụ thành công!");
            fetchServices();
        } catch (error) {
            toast.error("Lỗi khi xóa dịch vụ!");
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const cleanedValues = cleanDataForFirestore(values);

            if (editingService) {
                const serviceData = { ...cleanedValues, updatedAt: new Date() };
                await updateService(editingService.id, serviceData);
                toast.success("Cập nhật dịch vụ thành công!");
            } else {
                const serviceData = { ...cleanedValues, isActive: true, createdAt: new Date() };
                await addService(serviceData);
                toast.success("Thêm dịch vụ thành công!");
            }
            setIsModalVisible(false);
            fetchServices();
        } catch (error) {
            console.error("Đã có lỗi xảy ra trong quá trình xử lý form:", error);
            toast.error("Thao tác thất bại, vui lòng kiểm tra lại thông tin.");
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    const columns = [
        { title: 'Tên Dịch vụ', dataIndex: 'name', key: 'name', fixed: 'left', width: 250 },
        { title: 'Nhóm Dịch vụ', dataIndex: 'serviceGroup', key: 'serviceGroup', width: 150 },
        { title: 'Đơn vị tính', dataIndex: 'unit', key: 'unit', width: 100 },
        {
            title: 'Đơn giá (VNĐ)',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            render: (price) => new Intl.NumberFormat('vi-VN').format(price || 0),
        },
        { title: 'Bảo hành', dataIndex: 'officialWarranty', key: 'officialWarranty', width: 120 },
        { title: 'Xuất xứ', dataIndex: 'origin', key: 'origin', width: 120 },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => handleEdit(record)}>Sửa</a>
                    <Popconfirm
                        title="Xóa dịch vụ?"
                        description="Bạn có chắc muốn xóa dịch vụ này không?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <a>Xóa</a>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý Dịch vụ' }]} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
                <Title level={2} style={{ margin: 0 }}>Danh sách Dịch vụ</Title>
                <Space>
                    {/* --- THÊM Ô TÌM KIẾM --- */}
                    <Input.Search
                        placeholder="Tìm kiếm theo tên dịch vụ..."
                        onChange={handleSearch}
                        style={{ width: 300 }}
                        allowClear
                    />
                    {/* --- KẾT THÚC THÊM Ô TÌM KIẾM --- */}
                    <Button type="primary" onClick={handleAddNew}>Thêm dịch vụ mới</Button>
                </Space>
            </div>

            <Table
                columns={columns}
                // --- THAY ĐỔI DATASOURCE ---
                dataSource={filteredServices}
                // --- KẾT THÚC THAY ĐỔI ---
                rowKey="id"
                loading={loading}
                scroll={{ x: 1000 }}
            />

            <Modal
                title={editingService ? "Sửa Dịch vụ" : "Thêm Dịch vụ mới"}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                width={800}
                okText={editingService ? "Lưu" : "Thêm"}
                cancelText="Hủy"
            >
                {/* Form trong Modal không thay đổi */}
                <Form form={form} layout="vertical" name="service_form">
                    <Title level={4}>Thông tin cơ bản</Title>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="name" label="Tên Dịch vụ" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="description" label="Mô tả chi tiết">
                                <Input.TextArea rows={3} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title level={4}>Phân loại</Title>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="serviceGroup" label="Nhóm Dịch vụ">
                                <Select showSearch>
                                    {SERVICE_CATEGORIES.map(cat => <Option key={cat} value={cat}>{cat}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="marketingGroup" label="Nhóm Marketing">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="department" label="Bộ môn">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title level={4}>Giá & Bảo hành</Title>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="price" label="Đơn giá (VNĐ)" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\$\s?|(,*)/g, '')} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true }]}>
                                <Select showSearch>
                                    {SERVICE_UNITS.map(unit => <Option key={unit} value={unit}>{unit}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="origin" label="Xuất xứ">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="officialWarranty" label="Bảo hành chính hãng">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="clinicWarranty" label="Bảo hành phòng khám">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Title level={4}>Thông tin điều trị</Title>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="avgTreatmentMinutes" label="Số phút điều trị trung bình">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="avgTreatmentSessions" label="Số buổi điều trị trung bình">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default ServiceManagementPage;
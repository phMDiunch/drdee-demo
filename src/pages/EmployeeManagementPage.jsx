import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, Space, Typography,
    Breadcrumb, Popconfirm, Row, Col, DatePicker
} from 'antd';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../services/employeeService';
import { cleanDataForFirestore } from '../utils';
import { GENDERS, EMPLOYMENT_STATUSES, CONTRACT_TYPES, USER_ROLES } from '../constants';

const { Title } = Typography;
const { Option } = Select;

const EmployeeManagementPage = () => {
    const [form] = Form.useForm();
    const [allEmployees, setAllEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    // Lấy danh sách nhân viên
    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await getEmployees();
            setAllEmployees(data);
            setFilteredEmployees(data);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách nhân viên!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Xử lý tìm kiếm
    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = allEmployees.filter(emp =>
            emp.fullName.toLowerCase().includes(searchTerm) ||
            emp.phone.toLowerCase().includes(searchTerm)
        );
        setFilteredEmployees(filtered);
    };

    // Mở modal để thêm mới
    const handleAddNew = () => {
        setEditingEmployee(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // Mở modal để chỉnh sửa
    const handleEdit = (record) => {
        setEditingEmployee(record);
        // Chuyển đổi các trường ngày tháng sang đối tượng dayjs cho DatePicker
        const formValues = {
            ...record,
            dob: record.dob ? dayjs(record.dob.toDate()) : null,
            nationalIdIssueDate: record.nationalIdIssueDate ? dayjs(record.nationalIdIssueDate.toDate()) : null,
            startDate: record.startDate ? dayjs(record.startDate.toDate()) : null,
        };
        form.setFieldsValue(formValues);
        setIsModalVisible(true);
    };

    // Xử lý xóa
    const handleDelete = async (id) => {
        try {
            await deleteEmployee(id);
            toast.success("Xóa nhân viên thành công!");
            fetchEmployees();
        } catch (error) {
            toast.error("Lỗi khi xóa nhân viên!");
        }
    };

    // Xử lý khi nhấn OK trên modal
    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();

            // Chuyển đổi ngày tháng từ dayjs sang string YYYY-MM-DD trước khi lưu
            const processedValues = {
                ...values,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : '',
                nationalIdIssueDate: values.nationalIdIssueDate ? values.nationalIdIssueDate.format('YYYY-MM-DD') : '',
                startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : '',
            };

            const cleanedValues = cleanDataForFirestore(processedValues);

            if (editingEmployee) {
                const employeeData = { ...cleanedValues, updatedAt: new Date() };
                await updateEmployee(editingEmployee.id, employeeData);
                toast.success("Cập nhật nhân viên thành công!");
            } else {
                // Tạm thời chưa xử lý tạo tài khoản trên Firebase Auth, sẽ làm ở bước sau
                const employeeData = { ...cleanedValues, isActive: true, createdAt: new Date() };
                await addEmployee(employeeData);
                toast.success("Thêm nhân viên thành công!");
            }
            setIsModalVisible(false);
            fetchEmployees();
        } catch (error) {
            console.error("Lỗi xử lý form nhân viên:", error);
            toast.error("Thao tác thất bại, vui lòng kiểm tra lại.");
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
    };

    // Các cột hiển thị trên bảng
    const columns = [
        { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName', fixed: 'left', width: 200 },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone', width: 120 },
        { title: 'Email', dataIndex: 'email', key: 'email', width: 220 },
        { title: 'Chức vụ', dataIndex: 'position', key: 'position', width: 150 },
        { title: 'Trạng thái', dataIndex: 'employmentStatus', key: 'employmentStatus', width: 150 },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space size="middle">
                    <a onClick={() => handleEdit(record)}>Sửa</a>
                    <Popconfirm title="Chắc chắn xóa?" onConfirm={() => handleDelete(record.id)}>
                        <a>Xóa</a>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý Nhân viên' }]} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
                <Title level={2} style={{ margin: 0 }}>Danh sách Nhân viên</Title>
                <Space>
                    <Input.Search placeholder="Tìm theo tên, SĐT..." onChange={handleSearch} style={{ width: 300 }} allowClear />
                    <Button type="primary" onClick={handleAddNew}>Thêm nhân viên</Button>
                </Space>
            </div>

            <Table columns={columns} dataSource={filteredEmployees} rowKey="id" loading={loading} scroll={{ x: 1000 }} />

            <Modal title={editingEmployee ? "Sửa thông tin Nhân viên" : "Thêm Nhân viên mới"} open={isModalVisible} onOk={handleModalOk} onCancel={handleModalCancel} width={1000} okText="Lưu" cancelText="Hủy">
                <Form form={form} layout="vertical">
                    <Title level={4}>Thông tin cơ bản</Title>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="employeeCode" label="Mã nhân viên"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="dob" label="Ngày sinh"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="gender" label="Giới tính"><Select options={GENDERS.map(g => ({ label: g, value: g }))} /></Form.Item></Col>
                        <Col span={16}><Form.Item name="avatarUrl" label="Link ảnh đại diện"><Input /></Form.Item></Col>
                    </Row>
                    <Title level={4}>Thông tin liên hệ & Pháp lý</Title>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="email" label="Email" rules={[{ required: true }]}><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="currentAddress" label="Địa chỉ hiện tại"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="nationalId" label="Số CCCD"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="nationalIdIssueDate" label="Ngày cấp CCCD"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="nationalIdIssuePlace" label="Nơi cấp CCCD"><Input /></Form.Item></Col>
                    </Row>
                    <Title level={4}>Thông tin công việc</Title>
                    <Row gutter={16}>
                        <Col span={8}><Form.Item name="position" label="Chức vụ"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="department" label="Phòng ban"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="clinicId" label="Chi nhánh làm việc"><Input /></Form.Item></Col>
                        <Col span={8}><Form.Item name="startDate" label="Ngày bắt đầu làm việc"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
                        <Col span={8}><Form.Item name="employmentStatus" label="Trạng thái làm việc"><Select options={EMPLOYMENT_STATUSES.map(s => ({ label: s, value: s }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="contractType" label="Loại hợp đồng"><Select options={CONTRACT_TYPES.map(c => ({ label: c, value: c }))} /></Form.Item></Col>
                        <Col span={8}><Form.Item name="role" label="Vai trò hệ thống" rules={[{ required: true }]}><Select options={USER_ROLES.map(s => ({ label: s, value: s }))} /></Form.Item></Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeeManagementPage;
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, InputNumber, Select, Row, Col, Table, Typography, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { PAYMENT_METHODS } from '../constants';

const { Text } = Typography;

const PaymentForm = ({ visible, onSave, onCancel, customer, servicesToPay }) => {
    const [form] = Form.useForm();
    // THAY ĐỔI 1: State này sẽ là nguồn dữ liệu chính cho bảng
    const [allocations, setAllocations] = useState([]);

    useEffect(() => {
        if (visible) {
            form.resetFields();
            form.setFieldsValue({ paymentDate: dayjs() });
            // Khởi tạo state allocations với các dịch vụ cần trả và số tiền trả ban đầu là 0
            setAllocations(
                servicesToPay.map(s => ({
                    ...s,
                    payAmount: 0,
                }))
            );
        }
    }, [visible, form, servicesToPay]);

    const handleOk = () => {
        form.validateFields().then(values => {
            // Lọc ra những dịch vụ thực sự được trả tiền từ state allocations
            const finalAllocations = allocations
                .filter(s => s.payAmount > 0)
                .map(s => ({
                    serviceId: s.id,
                    amount: s.payAmount,
                }));

            onSave({ ...values, allocations: finalAllocations });
        }).catch(info => console.log('Validate Failed:', info));
    };

    // THAY ĐỔI 2: Sửa lại hoàn toàn hàm này
    const handlePayAmountChange = (serviceId, payAmount) => {
        // Cập nhật số tiền trả cho đúng dịch vụ trong state allocations
        const updatedAllocations = allocations.map(s =>
            s.id === serviceId ? { ...s, payAmount: payAmount || 0 } : s
        );
        setAllocations(updatedAllocations);

        // Tính tổng tiền từ state allocations đã được cập nhật
        const totalAmount = updatedAllocations.reduce((sum, s) => sum + (s.payAmount || 0), 0);
        form.setFieldsValue({ amount: totalAmount });
    };

    const allocationColumns = [
        { title: 'Dịch vụ', dataIndex: ['denormalized', 'tenDichVu'], key: 'name' },
        {
            title: 'Còn nợ', key: 'debt', render: (_, record) => {
                const debt = (record.finalPrice || 0) - (record.amountPaid || 0);
                return <Text type="danger">{new Intl.NumberFormat('vi-VN').format(debt)} đ</Text>;
            }
        },
        {
            title: 'Số tiền trả', key: 'pay', render: (_, record) => {
                const debt = (record.finalPrice || 0) - (record.amountPaid || 0);
                return (
                    <InputNumber
                        // THAY ĐỔI 3: Thêm formatter và value
                        max={debt}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        value={record.payAmount} // Hiển thị giá trị từ state
                        onChange={(value) => handlePayAmountChange(record.id, value)}
                        min={0}
                        style={{ width: 120 }}
                    />
                )
            }
        }
    ];

    return (
        <Modal open={visible} title={`Tạo Phiếu thu cho KH: ${customer?.fullName}`} width={800} onCancel={onCancel} onOk={handleOk}>
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="paymentDate" label="Ngày thu tiền" rules={[{ required: true }]}>
                            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="amount" label="Tổng tiền thu">
                            <InputNumber
                                disabled
                                style={{ width: '100%', fontWeight: 'bold', color: 'green' }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>
                    </Col>
                    {/* Phần thanh toán nhiều hình thức sẽ được thêm lại sau khi logic này ổn định */}
                    <Col span={24}>
                        <Form.Item name="method" label="Hình thức TT" rules={[{ required: true }]}>
                            <Select options={PAYMENT_METHODS.map(m => ({ label: m, value: m }))} />
                        </Form.Item>
                    </Col>
                </Row>
                <Table
                    title={() => <Text strong>Phân bổ tiền vào các dịch vụ</Text>}
                    columns={allocationColumns}
                    dataSource={allocations} // <-- THAY ĐỔI 4: Dùng state allocations
                    rowKey="id"
                    pagination={false}
                />
            </Form>
        </Modal>
    );
};

export default PaymentForm;
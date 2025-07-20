import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Tag, Space, Popconfirm } from 'antd';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { Timestamp } from 'firebase/firestore';

// Services & Components
import { getConsultedServicesByCustomerId, updateConsultedService, addConsultedService } from '../services/consultedService';
import { addPayment } from '../services/paymentService';
import ConsultedServiceForm from './ConsultedServiceForm';
import PaymentForm from './PaymentForm';

const ConsultedServices = ({ customer }) => {
    const [consultedServices, setConsultedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isServiceModalVisible, setIsServiceModalVisible] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isViewMode, setIsViewMode] = useState(false);

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

    // ... (Tất cả các hàm handle... của bạn: handleAddNewService, handleEditOrViewService, handleSaveService, handleConfirmService, handleOpenPaymentModal, handleSavePayment...)

    const columns = [ /* ... Cột của bảng dịch vụ như cũ ... */];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Button type="primary" onClick={() => { setIsViewMode(false); setEditingService(null); setIsServiceModalVisible(true); }}>
                    + Thêm Dịch vụ Tư vấn
                </Button>
                <Button onClick={() => setIsPaymentModalVisible(true)}>+ Tạo Phiếu thu</Button>
            </Space>

            <Table
                loading={loading}
                columns={columns}
                dataSource={consultedServices}
                rowKey="id"
            />

            {isServiceModalVisible && (
                <ConsultedServiceForm
                    visible={isServiceModalVisible}
                    onCancel={() => setIsServiceModalVisible(false)}
                    onSave={/* handleSaveService */}
                    initialValues={editingService}
                    isViewMode={isViewMode}
                />
            )}

            {isPaymentModalVisible && (
                <PaymentForm
                    visible={isPaymentModalVisible}
                    onCancel={() => setIsPaymentModalVisible(false)}
                    onSave={/* handleSavePayment */}
                    customer={customer}
                    servicesToPay={consultedServices.filter(s => s.serviceStatus === 'Đã chốt' && (s.finalPrice || 0) > (s.amountPaid || 0))}
                />
            )}
        </div>
    );
};

export default ConsultedServices;
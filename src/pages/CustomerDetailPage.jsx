import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Typography, Breadcrumb, Descriptions, Spin, Card, Tabs } from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useDataStore } from "../stores/dataStore";

// Component con
import ConsultedServices from "../components/ConsultedServices";
import PaymentHistory from "../components/PaymentHistory";
import SessionHistory from "../components/SessionHistory"; // Component mới

// Services
import { getCustomerById } from "../services/customerService";
import { getConsultedServicesByCustomerId } from "../services/consultedService";
import { getPaymentsByCustomerId } from "../services/paymentService";
import { getSessionsByCustomerId } from "../services/sessionService";

const { Title } = Typography;

const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const employees = useDataStore((state) => state.employees);
  const [customer, setCustomer] = useState(null);
  const [consultedServices, setConsultedServices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("1");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [customerData, servicesData, paymentsData, sessionsData] =
        await Promise.all([
          getCustomerById(customerId),
          getConsultedServicesByCustomerId(customerId),
          getPaymentsByCustomerId(customerId),
          getSessionsByCustomerId(customerId),
        ]);
      setCustomer(customerData);
      setConsultedServices(servicesData);
      setPayments(paymentsData);
      setSessions(sessionsData);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu.");
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const tabItems = [
    {
      key: "1",
      label: `Dịch vụ & Điều trị`,
      // Truyền consultedServices và hàm loadData xuống component con
      children: (
        <ConsultedServices
          customer={customer}
          services={consultedServices}
          reloadData={loadData}
        />
      ),
    },
    {
      key: "2",
      label: `Lịch sử Buổi điều trị`,
      children: (
        <SessionHistory
          sessions={sessions}
          customerServices={consultedServices}
          reloadData={loadData}
          customer={customer}
          employees={employees}
        />
      ),
    },
    {
      key: "3",
      label: `Lịch sử Thanh toán`,
      children: (
        <PaymentHistory
          payments={payments}
          loading={loading}
          customer={customer}
          services={consultedServices}
          reloadData={loadData}
        />
      ),
    },
  ];

  if (loading)
    return (
      <Spin size="large" style={{ display: "block", marginTop: "50px" }} />
    );

  return (
    <div style={{ padding: "24px" }}>
      <Breadcrumb
        items={[
          { title: <Link to="/customers">Khách hàng</Link> },
          { title: customer?.fullName || "Chi tiết" },
        ]}
      />
      <Title level={2} style={{ margin: "16px 0" }}>
        Hồ sơ khách hàng: {customer?.fullName}
      </Title>
      <Card style={{ marginBottom: "24px" }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Mã KH">
            {customer?.customerCode}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {customer?.phone}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {customer?.dob
              ? dayjs(customer.dob.toDate()).format("DD/MM/YYYY")
              : ""}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {customer?.gender}
          </Descriptions.Item>
        </Descriptions>
      </Card>
      <Card>
        <Tabs
          defaultActiveKey="1"
          items={tabItems}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </Card>
    </div>
  );
};

export default CustomerDetailPage;

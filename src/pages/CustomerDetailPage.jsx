import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Typography,
  Breadcrumb,
  Descriptions,
  Spin,
  Card,
  Button,
  Table,
  Tag,
} from "antd";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import TreatmentPlanForm from "../components/TreatmentPlanForm";
import { Timestamp } from "firebase/firestore";

import { getCustomerById } from "../services/customerService";
import {
  getPlansByCustomerId,
  addPlan,
  updatePlan,
} from "../services/treatmentPlanService";
import { cleanDataForFirestore } from "../utils";

const { Title, Text } = Typography;

const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const handleAddPlan = () => {
    setEditingPlan(null);
    setIsPlanModalVisible(true);
  };
  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsPlanModalVisible(true);
  };

  const handleCancelPlanModal = () => {
    setIsPlanModalVisible(false);
    // setEditingPlan(null);
  };

  const handleSavePlan = async (values) => {
    const cleanedValues = cleanDataForFirestore(values);
    console.log("Cleaned Values:", cleanedValues);
    const planData = {
      ...cleanedValues,
      planDate: Timestamp.now(),
      customerId: customerId,
      customerName: customer.fullName,
      // amountPaid: editingPlan ? editingPlan.amountPaid : 0,
      // debt:
      //   cleanedValues.totalAmount - (editingPlan ? editingPlan.amountPaid : 0),
      treatmentStatus: "Chưa điều trị",
      updatedAt: Timestamp.now(),
    };

    try {
      if (editingPlan) {
        // Logic sửa
        await updatePlan(editingPlan.id, planData);
        toast.success("Cập nhật kế hoạch thành công!");
      } else {
        // Logic thêm mới
        planData.createdAt = Timestamp.now();
        await addPlan(planData);
        toast.success("Tạo kế hoạch thành công!");
      }
      setIsPlanModalVisible(false);
      loadData(); // Tải lại danh sách kế hoạch
    } catch (error) {
      console.error("Lỗi khi lưu kế hoạch:", error);
      toast.error("Lỗi khi lưu kế hoạch.");
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const customerData = await getCustomerById(customerId);
      setCustomer(customerData);
      const plansData = await getPlansByCustomerId(customerId);
      console.log("Plans Data:", plansData);
      setPlans(plansData);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu chi tiết khách hàng.");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const serviceDetailColumns = [
    { title: "Tên dịch vụ", dataIndex: "name", key: "name" },
    {
      title: "Đơn giá gốc",
      dataIndex: "price",
      key: "price",
      render: (val) => `${new Intl.NumberFormat("vi-VN").format(val || 0)} đ`,
    },
    { title: "SL", dataIndex: "quantity", key: "quantity", align: "center" },
    {
      title: "Giá ưu đãi",
      dataIndex: "preferentialPrice",
      key: "preferentialPrice",
      render: (val) => `${new Intl.NumberFormat("vi-VN").format(val || 0)} đ`,
    },
    {
      title: "Thành tiền",
      dataIndex: "finalPrice",
      key: "finalPrice",
      render: (val) => (
        <Text strong>{`${new Intl.NumberFormat("vi-VN").format(
          val || 0
        )} đ`}</Text>
      ),
    },
  ];

  const planColumns = [
    {
      title: "Ngày tạo",
      dataIndex: "planDate",
      key: "planDate",
      render: (date) => (date ? dayjs(date.toDate()).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => new Intl.NumberFormat("vi-VN").format(amount) + " đ",
    },
    // {
    //   title: "Đã trả",
    //   dataIndex: "amountPaid",
    //   key: "amountPaid",
    //   render: (amount) => new Intl.NumberFormat("vi-VN").format(amount) + " đ",
    // },
    // {
    //   title: "Còn nợ",
    //   dataIndex: "debt",
    //   key: "debt",
    //   render: (amount) => (
    //     <Text type="danger">
    //       {new Intl.NumberFormat("vi-VN").format(amount) + " đ"}
    //     </Text>
    //   ),
    // },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color="blue">{status}</Tag>,
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <a onClick={() => handleEditPlan(record)}>Xem/Sửa</a>
      ),
    },
  ];

  if (loading) {
    return (
      <Spin size="large" style={{ display: "block", marginTop: "50px" }} />
    );
  }

  if (!customer) {
    return <Title level={3}>Không tìm thấy khách hàng.</Title>;
  }

  return (
    <div style={{ padding: "24px" }}>
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

      <Card title="Các Kế hoạch Điều trị">
        <Button
          type="primary"
          style={{ marginBottom: 16 }}
          onClick={handleAddPlan}
        >
          + Thêm Kế hoạch Điều trị mới
        </Button>
        <Table
          columns={planColumns}
          dataSource={plans}
          rowKey="id"
          expandable={{
            expandedRowRender: (record) => (
              <Table
                columns={serviceDetailColumns}
                dataSource={record.services}
                rowKey={(item) => item.serviceId || Math.random()}
                pagination={false}
              />
            ),
            // Chỉ hiển thị nút + nếu plan có dịch vụ
            rowExpandable: (record) =>
              record.services && record.services.length > 0,
          }}
        />
      </Card>
      {isPlanModalVisible && (
        <TreatmentPlanForm
          visible={isPlanModalVisible}
          onSave={handleSavePlan}
          onCancel={handleCancelPlanModal}
          customer={customer}
          initialValues={editingPlan}
        />
      )}
    </div>
  );
};

export default CustomerDetailPage;

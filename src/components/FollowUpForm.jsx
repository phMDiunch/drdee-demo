import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Button,
  DatePicker,
  Select,
  Input,
  Spin,
  Table,
  Typography,
  Radio,
  Tag,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";
import { getSessionsByDate } from "../services/sessionService";
import { useDataStore } from "../stores/dataStore";
import { CALL_OUTCOMES, CALL_OUTCOME_COLORS } from "../constants";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const FollowUpForm = ({ visible, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const employees = useDataStore((state) => state.employees);

  const [sessionsCache, setSessionsCache] = useState({});
  const [customersOnDate, setCustomersOnDate] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCustomersOnDate([]);
      setSelectedSession(null);
      form.resetFields();
    }
  }, [visible, form]);

  const handleDateChange = async (date) => {
    form.setFieldsValue({ customerId: null });
    setSelectedSession(null);
    if (!date) return;

    const dateString = dayjs(date).format("YYYY-MM-DD");

    if (sessionsCache[dateString]) {
      const sessions = sessionsCache[dateString];
      const uniqueCustomers = sessions.reduce((acc, session) => {
        if (!acc.find((cust) => cust.customerId === session.customerId)) {
          acc.push({
            customerId: session.customerId,
            customerName: session.customerName,
            customerCode: session.customerCode,
          });
        }
        return acc;
      }, []);

      setCustomersOnDate(uniqueCustomers);
      return;
    }

    setLoading(true);
    const sessions = await getSessionsByDate(date.toDate());
    setSessionsCache((prevCache) => ({ ...prevCache, [dateString]: sessions }));

    const uniqueCustomers = sessions.reduce((acc, session) => {
      if (!acc.find((cust) => cust.customerId === session.customerId)) {
        acc.push({
          customerId: session.customerId,
          customerName: session.customerName,
          customerCode: session.customerCode,
        });
      }
      return acc;
    }, []);
    setCustomersOnDate(uniqueCustomers);
    setLoading(false);
  };

  // SỬA LỖI Ở ĐÂY
  const handleCustomerChange = (customerId) => {
    // Lấy ngày đã chọn từ form
    const selectedDateObject = form.getFieldValue("treatmentDate");
    if (!selectedDateObject) return;

    // Tìm trong cache
    const dateString = dayjs(selectedDateObject).format("YYYY-MM-DD");
    const sessions = sessionsCache[dateString] || [];

    // Tìm session tương ứng
    const session = sessions.find((s) => s.customerId === customerId);
    setSelectedSession(session);
  };

  const getEmployeeNameById = (id) => {
    if (!id) return "";
    const employee = employees.find((e) => e.id === id);
    return employee ? employee.fullName : "N/A";
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSave({
          ...values,
          sessionId: selectedSession.id,
          customerName: selectedSession.customerName,
          customerCode: selectedSession.customerCode,
        });
      })
      .catch((info) => console.log("Validate Failed:", info));
  };

  const detailColumns = [
    { title: "Dịch vụ", dataIndex: "serviceName", key: "serviceName" },
    { title: "Nội dung", dataIndex: "notes", key: "notes" },
    {
      title: "Bác sĩ",
      dataIndex: "dentistId",
      key: "dentistId",
      render: (id) => getEmployeeNameById(id),
    },
    {
      title: "Trợ thủ",
      key: "assistants",
      render: (_, record) =>
        [
          getEmployeeNameById(record.assistant1Id),
          getEmployeeNameById(record.assistant2Id),
        ]
          .filter(Boolean)
          .join(", "),
    },
  ];

  return (
    <Modal
      open={visible}
      title="Thêm Lịch sử Chăm sóc"
      width={800}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          <Form.Item
            label="1. Chọn ngày điều trị của khách"
            name="treatmentDate"
          >
            <DatePicker
              format="DD/MM/YYYY"
              onChange={handleDateChange}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="customerId"
            label="2. Chọn khách hàng đã điều trị"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              placeholder="Chọn khách hàng"
              onChange={handleCustomerChange}
              disabled={customersOnDate.length === 0}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {customersOnDate.map((cust) => (
                <Option
                  key={cust.customerId}
                  value={cust.customerId}
                  label={`${cust.customerCode} - ${cust.customerName}`}
                >
                  {`${cust.customerCode} - ${cust.customerName}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedSession && (
            <div style={{ marginBottom: 16 }}>
              <Text strong>Thông tin buổi điều trị:</Text>
              <Table
                columns={detailColumns}
                dataSource={selectedSession.treatmentDetails}
                rowKey={(item) => item.consultedServiceId || Math.random()}
                pagination={false}
                size="small"
                style={{ marginTop: 8 }}
              />
            </div>
          )}

          <Form.Item
            name="callerId"
            label="Người gọi"
            rules={[{ required: true }]}
          >
            <Select>
              {employees.map((e) => (
                <Option key={e.id} value={e.id}>
                  {e.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="outcome"
            label="Kết quả"
            rules={[{ required: true }]}
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={CALL_OUTCOMES.OK}>
                <Tag color={CALL_OUTCOME_COLORS.OK} style={{ marginRight: 5 }}>
                  ●
                </Tag>
                {CALL_OUTCOMES.OK}
              </Radio.Button>
              <Radio.Button value={CALL_OUTCOMES.FOLLOW_UP}>
                <Tag
                  color={CALL_OUTCOME_COLORS.FOLLOW_UP}
                  style={{ marginRight: 5 }}
                >
                  ●
                </Tag>
                {CALL_OUTCOMES.FOLLOW_UP}
              </Radio.Button>
              <Radio.Button value={CALL_OUTCOMES.NO_CONTACT}>
                <Tag
                  color={CALL_OUTCOME_COLORS.NO_CONTACT}
                  style={{ marginRight: 5 }}
                >
                  ●
                </Tag>
                {CALL_OUTCOMES.NO_CONTACT}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="notes" label="Nội dung chăm sóc">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FollowUpForm;

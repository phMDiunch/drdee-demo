import React from "react";
import {
  Modal,
  Form,
  Button,
  DatePicker,
  Select,
  Input,
  Row,
  Col,
  Space,
  Divider,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useDataStore } from "../stores/dataStore";

const { Option } = Select;
const { TextArea } = Input;

const SessionForm = ({ visible, onSave, onCancel, customerServices }) => {
  const [form] = Form.useForm();
  const employees = useDataStore((state) => state.employees);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => onSave(values))
      .catch((info) => console.log("Validate Failed:", info));
  };

  const handleServiceChange = (serviceId, name) => {
    const selectedService = customerServices.find((s) => s.id === serviceId);
    if (selectedService) {
      const details = form.getFieldValue("treatmentDetails");
      details[name] = {
        ...details[name],
        serviceName: selectedService.denormalized?.tenDichVu || "",
      };
      form.setFieldsValue({ treatmentDetails: details });
    }
  };

  return (
    <Modal
      open={visible}
      title="Ghi nhận Buổi điều trị"
      width={1000}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ sessionDate: dayjs() }}
      >
        <Form.Item
          name="sessionDate"
          label="Ngày điều trị"
          rules={[{ required: true }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        <Divider>Chi tiết công việc</Divider>

        <Form.List name="treatmentDetails">
          {(fields, { add, remove }) => (
            <div
              style={{ display: "flex", flexDirection: "column", rowGap: 16 }}
            >
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  style={{
                    border: "1px solid #d9d9d9",
                    padding: "16px",
                    borderRadius: "8px",
                    position: "relative",
                  }}
                >
                  <MinusCircleOutlined
                    onClick={() => remove(name)}
                    style={{
                      color: "red",
                      position: "absolute",
                      top: 16,
                      right: 16,
                      zIndex: 1,
                    }}
                  />
                  <Form.Item
                    {...restField}
                    name={[name, "consultedServiceId"]}
                    label="Dịch vụ được điều trị"
                    rules={[{ required: true }]}
                  >
                    <Select
                      placeholder="Chọn từ kế hoạch đã chốt"
                      onChange={(value) => handleServiceChange(value, name)}
                    >
                      {customerServices.map((s) => (
                        <Option key={s.id} value={s.id}>
                          {s.denormalized?.tenDichVu}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "notes"]}
                    label="Nội dung điều trị"
                  >
                    <TextArea rows={2} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "nextSessionNotes"]}
                    label="Kế hoạch cho buổi sau"
                  >
                    <TextArea rows={1} />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "dentistId"]}
                        label="Bác sĩ"
                      >
                        <Select>
                          {employees.map((e) => (
                            <Option key={e.id} value={e.id}>
                              {e.fullName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "assistant1Id"]}
                        label="Trợ thủ 1"
                      >
                        <Select>
                          {employees.map((e) => (
                            <Option key={e.id} value={e.id}>
                              {e.fullName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "assistant2Id"]}
                        label="Trợ thủ 2"
                      >
                        <Select>
                          {employees.map((e) => (
                            <Option key={e.id} value={e.id}>
                              {e.fullName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Thêm công việc
              </Button>
            </div>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default SessionForm;

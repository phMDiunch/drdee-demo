import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  Form,
  Button,
  Input,
  DatePicker,
  Select,
  Space,
  InputNumber,
  Row,
  Col,
  Divider,
  Typography,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getServices } from "../services/service";
import { getEmployees } from "../services/employeeService";
import {
  TREATMENT_PLAN_STATUSES,
  TREATMENT_STATUSES,
  OFFICIAL_WARRANTIES,
  CLINIC_WARRANTIES,
} from "../constants";
import ToothSelectionModal from "./ToothSelectionModal";

const { Option, OptGroup } = Select;
const { Text } = Typography;

const TreatmentPlanForm = ({ visible, onSave, onCancel, initialValues }) => {
  const [form] = Form.useForm();
  const [servicesList, setServicesList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [salesList, setSalesList] = useState([]);
  const [isToothModalVisible, setIsToothModalVisible] = useState(false);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const services = await getServices();
      const employees = await getEmployees();
      setServicesList(services);
      setDoctorsList(
        employees.filter((e) => e.position?.toLowerCase().includes("bác sĩ"))
      );
      setSalesList(
        employees.filter((e) => e.role === "sale" || e.role === "employee")
      ); // Điều chỉnh role sale nếu cần
    };
    fetchData();
  }, []);

  const groupedServices = useMemo(() => {
    return servicesList.reduce((acc, service) => {
      const category = service.serviceGroup || "Khác";
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {});
  }, [servicesList]);

  const calculateAll = useCallback(
    (allValues) => {
      const services = allValues.services || [];
      let grandTotal = 0;
      let totalOriginalPrice = 0;

      const updatedServices = services
        .map((s) => {
          if (!s) return null;
          const price = s.price || 0;
          const quantity = s.quantity || 1;
          const preferentialPrice = s.preferentialPrice || 0;
          const finalPrice = preferentialPrice * quantity;

          grandTotal += finalPrice;
          totalOriginalPrice += price * quantity;

          return { ...s, finalPrice };
        })
        .filter(Boolean);

      const totalDiscount = totalOriginalPrice - grandTotal;
      form.setFieldsValue({
        services: updatedServices,
        totalAmount: grandTotal,
        totalDiscount,
      });
    },
    [form]
  );

  useEffect(() => {
    if (visible) {
      const defaultValues = {
        status: "Đang điều trị",
        planDate: dayjs(),
        services: [{ quantity: 1, preferentialPrice: 0, finalPrice: 0 }],
      };
      const valuesToSet = initialValues
        ? {
            ...initialValues,
            planDate:
              initialValues.planDate && !dayjs.isDayjs(initialValues.planDate)
                ? dayjs(initialValues.planDate.toDate())
                : dayjs(),
          }
        : defaultValues;

      form.setFieldsValue(valuesToSet);
      calculateAll(valuesToSet);
    } else {
      form.resetFields();
    }
  }, [initialValues, visible, form, calculateAll]);

  const handleValuesChange = (changedValues, allValues) => {
    if (changedValues.services) {
      const services = allValues.services || [];
      const updatedServices = services
        .map((s, index) => {
          if (!s) return null;
          const changedRow = changedValues.services[index];
          if (changedRow) {
            let {
              price = 0,
              quantity = 1,
              preferentialPrice = 0,
              finalPrice = 0,
            } = s;

            if (changedRow.hasOwnProperty("preferentialPrice")) {
              finalPrice = changedRow.preferentialPrice * quantity;
            } else if (changedRow.hasOwnProperty("finalPrice")) {
              preferentialPrice =
                quantity > 0 ? changedRow.finalPrice / quantity : 0;
            } else {
              // quantity or price changed
              finalPrice = preferentialPrice * quantity;
            }
            return { ...s, preferentialPrice, finalPrice };
          }
          return s;
        })
        .filter(Boolean);
      calculateAll({ ...allValues, services: updatedServices });
    }
  };

  const handleServiceChange = (serviceId, name) => {
    const selectedService = servicesList.find((s) => s.id === serviceId);
    if (selectedService) {
      const services = form.getFieldValue("services");
      services[name] = {
        ...services[name],
        price: selectedService.price,
        preferentialPrice: selectedService.price,
        unit: selectedService.unit,
        officialWarranty: selectedService.officialWarranty || null,
        clinicWarranty: selectedService.clinicWarranty || null,
      };
      form.setFieldsValue({ services });
      calculateAll(form.getFieldsValue());
    }
  };

  const handleRemoveService = (name, remove) => {
    remove(name);
    setTimeout(() => calculateAll(form.getFieldsValue()), 0);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => onSave(values))
      .catch((info) => console.log("Validate Failed:", info));
  };
  const openToothModal = (index) => {
    setCurrentServiceIndex(index);
    setIsToothModalVisible(true);
  };
  const handleToothSelection = (selectedTeeth) => {
    const services = form.getFieldValue("services");
    services[currentServiceIndex].toothPositions = selectedTeeth.join(", ");
    if (services[currentServiceIndex].unit === "Răng") {
      services[currentServiceIndex].quantity = selectedTeeth.length || 1;
    }
    form.setFieldsValue({ services });
    setIsToothModalVisible(false);
    calculateAll(form.getFieldsValue());
  };

  return (
    <>
      <Modal
        open={visible}
        title="Kế hoạch Điều trị"
        width={1200}
        onCancel={onCancel}
        onOk={handleOk}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
          <Row gutter={16}>{/* ... Các trường chung ... */}</Row>
          <Divider>Danh sách dịch vụ</Divider>
          <Form.List name="services">
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
                      onClick={() => handleRemoveService(name, remove)}
                      style={{
                        color: "red",
                        position: "absolute",
                        top: 16,
                        right: 16,
                        fontSize: "18px",
                        cursor: "pointer",
                        zIndex: 1,
                      }}
                    />
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "serviceId"]}
                          label="Dịch vụ"
                          rules={[{ required: true }]}
                        >
                          <Select
                            placeholder="Chọn dịch vụ"
                            onChange={(value) =>
                              handleServiceChange(value, name)
                            }
                          >
                            {Object.entries(groupedServices).map(
                              ([category, services]) => (
                                <OptGroup label={category} key={category}>
                                  {services.map((s) => (
                                    <Option key={s.id} value={s.id}>
                                      {s.name}
                                    </Option>
                                  ))}
                                </OptGroup>
                              )
                            )}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "unit"]}
                          label="ĐV tính"
                        >
                          <Input disabled />
                        </Form.Item>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "quantity"]}
                          label="Số lượng"
                        >
                          <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          {...restField}
                          name={[name, "toothPositions"]}
                          label="Vị trí răng"
                        >
                          <Input
                            placeholder="Bấm nút bút để chọn răng"
                            addonAfter={
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => openToothModal(name)}
                              />
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "price"]}
                          label="Đơn giá gốc"
                        >
                          <InputNumber
                            disabled
                            style={{ width: "100%" }}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "preferentialPrice"]}
                          label="Giá ưu đãi (1 ĐV)"
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "finalPrice"]}
                          label="Thành tiền"
                        >
                          <InputNumber
                            style={{ width: "100%" }}
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                            }
                            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "officialWarranty"]}
                          label="Bảo hành chính hãng"
                        >
                          <Select
                            options={OFFICIAL_WARRANTIES.map((w) => ({
                              label: w,
                              value: w,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          {...restField}
                          name={[name, "clinicWarranty"]}
                          label="Bảo hành uy tín"
                        >
                          <Select
                            options={CLINIC_WARRANTIES.map((w) => ({
                              label: w,
                              value: w,
                            }))}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "consultingDoctorId"]}
                          label="BS Tư vấn"
                        >
                          <Select placeholder="Chọn BS">
                            {doctorsList.map((e) => (
                              <Option key={e.id} value={e.id}>
                                {e.fullName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "consultingSaleId"]}
                          label="Sale Tư vấn"
                        >
                          <Select placeholder="Chọn Sale">
                            {salesList.map((e) => (
                              <Option key={e.id} value={e.id}>
                                {e.fullName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "treatingDoctorId"]}
                          label="BS Điều trị"
                        >
                          <Select placeholder="Chọn BS">
                            {doctorsList.map((e) => (
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
                  onClick={() =>
                    add({ quantity: 1, preferentialPrice: 0, finalPrice: 0 })
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm dịch vụ
                </Button>
              </div>
            )}
          </Form.List>
          <Divider />
          <Row justify="end" gutter={16}>
            <Col>
              <Text>Tổng giảm giá:</Text>
              <Form.Item name="totalDiscount" noStyle>
                <InputNumber
                  disabled
                  style={{
                    width: 150,
                    color: "red",
                    fontWeight: "bold",
                    marginLeft: "8px",
                  }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
            <Col>
              <Text strong>Tổng thành tiền:</Text>
              <Form.Item name="totalAmount" noStyle>
                <InputNumber
                  disabled
                  style={{ width: 150, fontWeight: "bold", marginLeft: "8px" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      {currentServiceIndex !== null && (
        <ToothSelectionModal
          visible={isToothModalVisible}
          onOk={handleToothSelection}
          onCancel={() => setIsToothModalVisible(false)}
          initialSelected={(
            form.getFieldValue([
              "services",
              currentServiceIndex,
              "toothPositions",
            ]) || ""
          )
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)}
        />
      )}
    </>
  );
};

export default TreatmentPlanForm;

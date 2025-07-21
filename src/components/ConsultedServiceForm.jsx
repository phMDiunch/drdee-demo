import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Button,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Row,
  Col,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ToothSelectionModal from "./ToothSelectionModal";
import { useDataStore } from "../stores/dataStore";
import { OFFICIAL_WARRANTIES, CLINIC_WARRANTIES } from "../constants";
import { cleanDataForFirestore } from "../utils";

const { Option, OptGroup } = Select;

const DEFAULT_FORM = {
  treatmentStatus: "Chưa điều trị",
  quantity: 1,
  preferentialPrice: 0,
  finalPrice: 0,
};

function ConsultedServiceForm({
  visible,
  onSave,
  onCancel,
  initialValues,
  isViewMode = false,
}) {
  const [form] = Form.useForm();
  const [isToothModalVisible, setIsToothModalVisible] = useState(false);

  // Lưu ý: dùng zustand như dưới đây để tránh infinite update!!!
  const services = useDataStore((state) => state.services);
  const employees = useDataStore((state) => state.employees);

  // Lọc danh sách bác sĩ, sales (memo tránh re-render)
  const doctorsList = useMemo(
    () => employees.filter((e) => e.title?.toLowerCase().includes("bác sĩ")),
    [employees]
  );
  const salesList = useMemo(
    () => employees.filter((e) => e.title?.toLowerCase().includes("sale off")),
    [employees]
  );

  // Gom nhóm dịch vụ
  const groupedServices = useMemo(() => {
    return services.reduce((acc, service) => {
      const group = service.serviceGroup || "Khác";
      if (!acc[group]) acc[group] = [];
      acc[group].push(service);
      return acc;
    }, {});
  }, [services]);

  useEffect(() => {
    if (visible) {
      let initial = { ...DEFAULT_FORM, consultationDate: dayjs() };
      if (initialValues) {
        initial = {
          ...DEFAULT_FORM,
          ...initialValues,
          consultationDate: initialValues.consultationDate
            ? dayjs(
                typeof initialValues.consultationDate === "string"
                  ? initialValues.consultationDate
                  : initialValues.consultationDate.toDate()
              )
            : dayjs(),
        };
      }
      form.setFieldsValue(initial);
    } else {
      form.resetFields();
    }
    // eslint-disable-next-line
  }, [visible, initialValues]);

  // Chọn dịch vụ -> auto fill giá trị liên quan
  const handleServiceChange = (serviceId) => {
    const selected = services.find((s) => s.id === serviceId);
    if (selected) {
      form.setFieldsValue({
        price: selected.price,
        preferentialPrice: selected.price,
        unit: selected.unit,
        officialWarranty: selected.officialWarranty || null,
        clinicWarranty: selected.clinicWarranty || null,
        denormalized: {
          tenDichVu: selected.name,
          nhomDichVu: selected.serviceGroup,
          donVi: selected.unit,
          giaNiemYet: selected.price,
          baoHanhChinhHang: selected.officialWarranty,
          baoHanhUyTin: selected.clinicWarranty,
        },
      });
      // Tự động tính lại finalPrice
      setTimeout(() => {
        const { preferentialPrice, quantity } = form.getFieldsValue();
        form.setFieldsValue({
          finalPrice: (preferentialPrice || 0) * (quantity || 1),
        });
      }, 0);
    }
  };

  // Chọn răng
  const handleToothSelection = (selectedTeeth) => {
    const unit = form.getFieldValue("unit");
    form.setFieldsValue({
      toothPositions: selectedTeeth.join(", "),
      quantity:
        unit === "Răng"
          ? selectedTeeth.length || 1
          : form.getFieldValue("quantity"),
    });
    setIsToothModalVisible(false);
    setTimeout(() => {
      const { preferentialPrice, quantity } = form.getFieldsValue();
      form.setFieldsValue({
        finalPrice: (preferentialPrice || 0) * (quantity || 1),
      });
    }, 0);
  };

  // Tránh lặp onValuesChange bằng kiểm tra value
  const onValuesChange = (changed, all) => {
    if ("preferentialPrice" in changed || "quantity" in changed) {
      const newFinal = (all.preferentialPrice || 0) * (all.quantity || 1);
      if (all.finalPrice !== newFinal)
        form.setFieldsValue({ finalPrice: newFinal });
    }
    if ("finalPrice" in changed) {
      if (all.quantity > 0) {
        const calcPreferential = all.finalPrice / all.quantity;
        if (all.preferentialPrice !== calcPreferential)
          form.setFieldsValue({ preferentialPrice: calcPreferential });
      }
    }
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave(values);
    });
  };

  return (
    <>
      <Modal
        open={visible}
        title={
          isViewMode
            ? "Xem Dịch vụ"
            : initialValues
            ? "Sửa Dịch vụ"
            : "Thêm Dịch vụ"
        }
        width={1000}
        onCancel={onCancel}
        footer={[
          <Button key="back" onClick={onCancel}>
            {isViewMode ? "Đóng" : "Hủy"}
          </Button>,
          !isViewMode && (
            <Button key="submit" type="primary" onClick={handleOk}>
              Lưu
            </Button>
          ),
        ]}
      >
        <Form form={form} layout="vertical" onValuesChange={onValuesChange}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="consultationDate"
                label="Ngày tư vấn"
                rules={[{ required: true }]}
              >
                <DatePicker
                  disabled={isViewMode}
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item
                name="serviceId"
                label="Dịch vụ"
                rules={[{ required: true }]}
              >
                <Select
                  disabled={isViewMode}
                  placeholder="Chọn dịch vụ"
                  onChange={handleServiceChange}
                  showSearch
                  optionFilterProp="children"
                >
                  {Object.entries(groupedServices).map(([category, list]) => (
                    <OptGroup label={category} key={category}>
                      {list.map((s) => (
                        <Option key={s.id} value={s.id}>
                          {s.name}
                        </Option>
                      ))}
                    </OptGroup>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="unit" label="ĐV tính">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="toothPositions" label="Vị trí răng">
                <Input
                  disabled={isViewMode}
                  addonAfter={
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => setIsToothModalVisible(true)}
                      disabled={isViewMode}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="quantity" label="Số lượng">
                <InputNumber
                  disabled={isViewMode}
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="price" label="Đơn giá gốc">
                <InputNumber
                  disabled
                  style={{ width: "100%" }}
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="preferentialPrice" label="Giá ưu đãi (1 ĐV)">
                <InputNumber
                  disabled={isViewMode}
                  style={{ width: "100%" }}
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="finalPrice" label="Thành tiền">
                <InputNumber
                  disabled={isViewMode}
                  style={{ width: "100%" }}
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="officialWarranty" label="Bảo hành chính hãng">
                <Select
                  disabled={isViewMode}
                  options={OFFICIAL_WARRANTIES.map((w) => ({
                    label: w,
                    value: w,
                  }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="clinicWarranty" label="Bảo hành uy tín">
                <Select
                  disabled={isViewMode}
                  options={CLINIC_WARRANTIES.map((w) => ({
                    label: w,
                    value: w,
                  }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="consultingDoctorId" label="BS Tư vấn">
                <Select
                  disabled={isViewMode}
                  placeholder="Chọn BS"
                  options={doctorsList.map((e) => ({
                    label: e.fullName,
                    value: e.id,
                  }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="consultingSaleId" label="Sale Tư vấn">
                <Select
                  disabled={isViewMode}
                  placeholder="Chọn Sale"
                  options={salesList.map((e) => ({
                    label: e.fullName,
                    value: e.id,
                  }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="treatingDoctorId" label="BS Điều trị">
                <Select
                  disabled={isViewMode}
                  placeholder="Chọn BS"
                  options={doctorsList.map((e) => ({
                    label: e.fullName,
                    value: e.id,
                  }))}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Form.Item name="denormalized" hidden>
              <Input />
            </Form.Item>
          </Row>
        </Form>
      </Modal>
      <ToothSelectionModal
        visible={isToothModalVisible}
        onOk={handleToothSelection}
        onCancel={() => setIsToothModalVisible(false)}
        initialSelected={(form.getFieldValue("toothPositions") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)}
      />
    </>
  );
}

export default ConsultedServiceForm;

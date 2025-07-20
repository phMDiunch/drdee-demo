import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Spin,
  Typography,
  Breadcrumb,
  Popconfirm,
} from "antd";
import { toast } from "react-toastify";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";

import {
  getAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
} from "../services/appointmentService";
import { getCustomers } from "../services/customerService";
import { APPOINTMENT_STATUSES } from "../constants";
import { cleanDataForFirestore } from "../utils";

import { useDataStore } from '../stores/dataStore';

const { Title } = Typography;
const { Option } = Select;

const AppointmentPage = () => {
  const [form] = Form.useForm();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [customers, setCustomers] = useState([]);


  const doctorsList = useDataStore((state) => state.doctors);

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [initialDateTime, setInitialDateTime] = useState(null);

  // Tải tất cả dữ liệu cần thiết
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [appointmentsData, customersData] =
        await Promise.all([getAppointments(), getCustomers()]);
      setEvents(appointmentsData);
      setCustomers(customersData);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Mở modal khi click vào một slot trống trên lịch
  const handleDateClick = (arg) => {
    setSelectedEventId(null);
    setInitialDateTime(dayjs(arg.date));
    form.resetFields();
    form.setFieldsValue({
      status: "SCHEDULED", // Mặc định khi tạo mới
    });
    setIsModalVisible(true);
  };

  // Mở modal khi click vào một lịch hẹn đã có
  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEventId(event.id);

    const eventData = {
      ...event.extendedProps,
      appointmentDateTime: dayjs(event.start),
    };

    form.setFieldsValue(eventData);
    setIsModalVisible(true);
  };

  // Xử lý khi kéo-thả để dời lịch
  const handleEventDrop = async (dropInfo) => {
    const { event } = dropInfo;
    try {
      await updateAppointment(event.id, {
        appointmentDateTime: Timestamp.fromDate(event.start),
      });
      toast.success("Cập nhật lịch hẹn thành công!");
      loadInitialData();
    } catch (error) {
      toast.error("Lỗi khi cập nhật lịch hẹn!");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Xử lý khi nhấn Lưu trên modal
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);

      const selectedCustomer = customers.find(
        (c) => c.id === values.customerId
      );
      const selectedDentist = doctorsList.find((e) => e.id === values.dentistId);

      const appointmentData = cleanDataForFirestore({
        ...values,
        appointmentDateTime: Timestamp.fromDate(
          values.appointmentDateTime.toDate()
        ),
        customerName: selectedCustomer?.fullName || "",
        customerPhone: selectedCustomer?.phone || "",
        dentistName: selectedDentist?.fullName || "",
        updatedAt: Timestamp.now(),
      });

      if (selectedEventId) {
        // Chế độ Sửa
        await updateAppointment(selectedEventId, appointmentData);
        toast.success("Cập nhật lịch hẹn thành công!");
      } else {
        // Chế độ Thêm mới
        await addAppointment({
          ...appointmentData,
          createdAt: Timestamp.now(),
        });
        toast.success("Tạo lịch hẹn thành công!");
      }

      setIsModalVisible(false);
      loadInitialData(); // Tải lại toàn bộ lịch hẹn
    } catch (error) {
      console.error("Lỗi lưu lịch hẹn:", error);
      toast.error("Thao tác thất bại!");
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý xóa lịch hẹn
  const handleDeleteAppointment = async () => {
    if (!selectedEventId) return;
    try {
      await deleteAppointment(selectedEventId);
      toast.success("Xóa lịch hẹn thành công!");
      setIsModalVisible(false);
      loadInitialData();
    } catch (error) {
      toast.error("Lỗi khi xóa lịch hẹn!");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Breadcrumb items={[{ title: "Trang chủ" }, { title: "Lịch hẹn" }]} />
      <Title level={2} style={{ margin: "16px 0" }}>
        Sơ đồ Lịch hẹn
      </Title>

      <Spin spinning={loading}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="timeGridWeek"
          locale="vi"
          allDaySlot={false}
          events={events}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
        />
      </Spin>

      <Modal
        title={selectedEventId ? "Chỉnh sửa Lịch hẹn" : "Tạo Lịch hẹn mới"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={[
          selectedEventId && (
            <Popconfirm
              title="Chắc chắn xóa?"
              onConfirm={handleDeleteAppointment}
            >
              <Button key="delete" type="primary" danger>
                Xóa
              </Button>
            </Popconfirm>
          ),
          <Button key="back" onClick={handleModalCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isSaving}
            onClick={handleFormSubmit}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ appointmentDateTime: initialDateTime }}
        >
          <Form.Item
            name="customerId"
            label="Khách hàng"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {customers.map((cust) => (
                <Option
                  key={cust.id}
                  value={cust.id}
                >{`${cust.fullName} - ${cust.phone}`}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="dentistId"
            label="Bác sĩ"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {doctorsList.map((emp) => (
                <Option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="appointmentDateTime"
            label="Thời gian hẹn"
            rules={[{ required: true }]}
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select>
              {Object.entries(APPOINTMENT_STATUSES).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AppointmentPage;

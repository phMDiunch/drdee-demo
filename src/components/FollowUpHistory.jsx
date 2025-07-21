import React from "react";
import { Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { CALL_OUTCOMES, CALL_OUTCOME_COLORS } from "../constants"; // Giả sử bạn có hằng số màu

const { Text } = Typography;

const FollowUpHistory = ({ followUps, loading }) => {
  const columns = [
    {
      title: "Ngày gọi",
      dataIndex: "callDate",
      render: (date) => (date ? dayjs(date.toDate()).format("DD/MM/YYYY") : ""),
      sorter: (a, b) => a.callDate.seconds - b.callDate.seconds,
    },
    { title: "Khách hàng", dataIndex: "customerName" },
    {
      title: "Kết quả",
      dataIndex: "outcome",
      render: (outcome) => {
        if (!outcome) return "";
        const colorKey = Object.keys(CALL_OUTCOMES).find(
          (key) => CALL_OUTCOMES[key] === outcome
        );
        return <Tag color={CALL_OUTCOME_COLORS[colorKey]}>{outcome}</Tag>;
      },
    },
    { title: "Ghi chú", dataIndex: "notes" },
  ];

  return (
    <Table
      loading={loading}
      columns={columns}
      dataSource={followUps}
      rowKey="id"
      pagination={{ pageSize: 5 }}
    />
  );
};

export default FollowUpHistory;

// src/components/ToothSelectionModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Row, Col, Typography } from "antd";
import { PERMANENT_TEETH_POSITIONS, MILK_TEETH_POSITIONS } from "../constants";

const { Title, Text } = Typography;

const ToothButton = ({ tooth, onClick, isSelected }) => (
  <Button
    type={isSelected ? "primary" : "default"}
    onClick={() => onClick(tooth)}
    style={{ width: "50px", margin: "2px" }}
  >
    {tooth.replace("R", "")}
  </Button>
);

const ToothQuadrant = ({ title, teeth, onToothClick, selectedTeeth }) => (
  <Col span={12} style={{ marginBottom: 16 }}>
    <Title level={5}>{title}</Title>
    <div>
      {teeth.map((tooth) => (
        <ToothButton
          key={tooth}
          tooth={tooth}
          onClick={onToothClick}
          isSelected={selectedTeeth.includes(tooth)}
        />
      ))}
    </div>
  </Col>
);

const ToothSelectionModal = ({
  visible,
  onOk,
  onCancel,
  initialSelected = [],
}) => {
  const [selectedTeeth, setSelectedTeeth] = useState(initialSelected);

  useEffect(() => {
    if (visible) {
      setSelectedTeeth(initialSelected);
    }
  }, [visible, initialSelected]);

  const handleToothClick = (tooth) => {
    setSelectedTeeth((prev) =>
      prev.includes(tooth) ? prev.filter((t) => t !== tooth) : [...prev, tooth]
    );
  };

  const handleConfirm = () => {
    onOk(selectedTeeth);
  };

  return (
    <Modal
      open={visible}
      title="Chọn vị trí răng"
      width={600}
      onOk={handleConfirm}
      onCancel={onCancel}
    >
      <Title level={4}>Răng vĩnh viễn</Title>
      <Row>
        <ToothQuadrant
          title="Hàm trên bên phải (1)"
          teeth={PERMANENT_TEETH_POSITIONS.slice(0, 8)}
          onToothClick={handleToothClick}
          selectedTeeth={selectedTeeth}
        />
        <ToothQuadrant
          title="Hàm trên bên trái (2)"
          teeth={PERMANENT_TEETH_POSITIONS.slice(8, 16)}
          onToothClick={handleToothClick}
          selectedTeeth={selectedTeeth}
        />
        <ToothQuadrant
          title="Hàm dưới bên trái (3)"
          teeth={PERMANENT_TEETH_POSITIONS.slice(16, 24)}
          onToothClick={handleToothClick}
          selectedTeeth={selectedTeeth}
        />
        <ToothQuadrant
          title="Hàm dưới bên phải (4)"
          teeth={PERMANENT_TEETH_POSITIONS.slice(24, 32)}
          onToothClick={handleToothClick}
          selectedTeeth={selectedTeeth}
        />
      </Row>
      <Title level={4} style={{ marginTop: 16 }}>
        Răng sữa
      </Title>
      <Row>
        <ToothQuadrant
          title="Hàm trên bên phải (5)"
          teeth={MILK_TEETH_POSITIONS.slice(0, 5)}
          onToothClick={handleToothClick}
          selectedTeeth={selectedTeeth}
        />
        <ToothQuadrant
          title="Hàm trên bên trái (6)"
          teeth={MILK_TEETH_POSITIONS.slice(5, 10)}
          onToothClick={handleToothClick}
          selectedTeeth={selectedTeeth}
        />
        <ToothQuadrant
          title="Hàm dưới bên trái (7)"
          teeth={MILK_TEETH_POSITIONS.slice(10, 15)}
          onToothClick={handleToothClick}
          selectedTeeth={selectedTeeth}
        />
        <ToothQuadrant
          title="Hàm dưới bên phải (8)"
          teeth={MILK_TEETH_POSITIONS.slice(15, 20)}
          onToothClick={handleToothClick}
          selectedTeeth={selectedTeeth}
        />
      </Row>
    </Modal>
  );
};

export default ToothSelectionModal;

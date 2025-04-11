"use client";

import { Modal, Button, Form } from "react-bootstrap";
import { saveSettings } from "../utils/storage";

const SettingsModal = ({ show, onHide, settings, setSettings }) => {
  const handleChange = (field, value) => {
    const updatedSettings = { ...settings, [field]: value };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-gear me-2"></i>
          Settings
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Font Size</Form.Label>
            <Form.Select
              value={settings.fontSize}
              onChange={(e) => handleChange("fontSize", e.target.value)}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SettingsModal;

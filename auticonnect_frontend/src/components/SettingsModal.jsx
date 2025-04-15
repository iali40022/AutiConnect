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

          <Form.Group className="mb-3">
            <Form.Label>Theme</Form.Label>
            <Form.Select
              value={settings.theme}
              onChange={(e) => handleChange("theme", e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="high-contrast-switch"
              label="High Contrast Mode"
              checked={settings.highContrast}
              onChange={(e) => handleChange("highContrast", e.target.checked)}
            />
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

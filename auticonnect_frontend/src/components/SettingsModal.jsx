"use client";

import { Modal, Button, Form } from "react-bootstrap";
import { saveSettings } from "../utils/storage";

const SettingsModal = ({ show, onHide, settings, setSettings, t }) => {
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
          {t("settings")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>{t("font_size")}</Form.Label>
            <Form.Select
              value={settings.fontSize}
              onChange={(e) => handleChange("fontSize", e.target.value)}
            >
              <option value="small">{t("small")}</option>
              <option value="medium">{t("medium")}</option>
              <option value="large">{t("large")}</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("theme")}</Form.Label>
            <Form.Select
              value={settings.theme}
              onChange={(e) => handleChange("theme", e.target.value)}
            >
              <option value="light">{t("light")}</option>
              <option value="dark">{t("dark")}</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="high-contrast-switch"
              label={t("high_contrast_mode")}
              checked={settings.highContrast}
              onChange={(e) => handleChange("highContrast", e.target.checked)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t("language")}</Form.Label>
            <Form.Select
              value={settings.language}
              onChange={(e) => handleChange("language", e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t("close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SettingsModal;

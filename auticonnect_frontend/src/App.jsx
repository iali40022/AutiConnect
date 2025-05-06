"use client";

import { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Nav,
  Tab,
  Navbar,
  Spinner,
  OverlayTrigger,
  Tooltip,
  ListGroup,
  Alert,
  ButtonGroup,
  Dropdown,
} from "react-bootstrap";
import "./App.css";
import SettingsModal from "./components/SettingsModal";
import {
  getFavorites,
  saveResponse,
  deleteFavorite,
  getSettings,
  saveSettings,
} from "./utils/storage";
import { translations } from "./utils/translations";

function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef(window.speechSynthesis);

  // Personalisation states
  const [showSettings, setShowSettings] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [settings, setSettings] = useState({
    fontSize: "medium",
    theme: "light",
    highContrast: false,
    language: "en",
  });

  // Load personalisation data on component mount
  useEffect(() => {
    const loadedFavorites = getFavorites();
    setFavorites(loadedFavorites);

    const loadedSettings = getSettings();
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
  }, []);

  // Apply settings
  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize =
      settings.fontSize === "small"
        ? "14px"
        : settings.fontSize === "large"
        ? "18px"
        : "16px";

    // Apply theme to document body
    document.body.className = settings.theme === "dark" ? "dark-theme" : "";

    // Apply high contrast
    if (settings.highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }

    // Save settings
    saveSettings(settings);
  }, [settings]);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  const handleQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          language: settings.language,
        }),
      });

      const data = await response.json();
      const newAnswer = data.answer || "No response from backend.";
      setAnswer(newAnswer);
    } catch (err) {
      setAnswer("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const clearChat = () => {
    setQuery("");
    setAnswer("");
    stopSpeech();
  };

  const handleSaveFavorite = () => {
    if (!answer) return;

    const favorite = {
      id: Date.now().toString(),
      question: query,
      answer: answer,
      timestamp: new Date().toISOString(),
    };

    saveResponse(favorite);
    setFavorites([...favorites, favorite]);

    // Show temporary success message
    const successAlert = document.getElementById("save-success");
    successAlert.classList.remove("d-none");
    setTimeout(() => {
      successAlert.classList.add("d-none");
    }, 3000);
  };

  // Delete functionality
  const handleDeleteFavorite = (id) => {
    deleteFavorite(id);
    setFavorites(favorites.filter((fav) => fav.id !== id));
  };

  // Theme toggle
  const toggleTheme = () => {
    setSettings({
      ...settings,
      theme: settings.theme === "light" ? "dark" : "light",
    });
  };

  // High contrast toggle
  const toggleHighContrast = () => {
    setSettings({
      ...settings,
      highContrast: !settings.highContrast,
    });
  };

  // Language change
  const changeLanguage = (lang) => {
    setSettings({
      ...settings,
      language: lang,
    });
  };

  // Text-to-Speech functionality
  const speakText = (text) => {
    if (!text) return;

    // Stop any ongoing speech
    stopSpeech();

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set language based on current settings
    utterance.lang =
      settings.language === "es"
        ? "es-ES"
        : settings.language === "fr"
        ? "fr-FR"
        : "en-US";

    // Event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Speak
    speechSynthRef.current.speak(utterance);
  };

  const stopSpeech = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Get translated text
  const t = (key) => {
    return (
      translations[settings.language]?.[key] || translations.en[key] || key
    );
  };

  const exampleQuestions = [
    t("example_question_1"),
    t("example_question_2"),
    t("example_question_3"),
    t("example_question_4"),
    t("example_question_5"),
  ];

  return (
    <div
      className={`app-container ${
        settings.theme === "dark" ? "dark-theme" : ""
      } ${settings.highContrast ? "high-contrast" : ""}`}
    >
      <Navbar expand="lg" className="navbar-custom">
        <Container>
          <Navbar.Brand href="#home" className="brand">
            <i className="bi bi-stars me-2"></i>
            <span className="gradient-text">AutiConnect</span>
          </Navbar.Brand>

          <div className="d-flex align-items-center">
            {/* Language Selector */}
            <Dropdown className="me-2">
              <Dropdown.Toggle
                variant="outline-secondary"
                id="language-dropdown"
                size="sm"
              >
                <i className="bi bi-globe me-1"></i>
                {settings.language === "en"
                  ? "EN"
                  : settings.language === "es"
                  ? "ES"
                  : "FR"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => changeLanguage("en")}
                  active={settings.language === "en"}
                >
                  English
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => changeLanguage("es")}
                  active={settings.language === "es"}
                >
                  Español
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => changeLanguage("fr")}
                  active={settings.language === "fr"}
                >
                  Français
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Theme Toggle */}
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="theme-tooltip">
                  {settings.theme === "light"
                    ? t("dark_mode")
                    : t("light_mode")}
                </Tooltip>
              }
            >
              <Button
                variant="outline-secondary"
                className="me-2"
                size="sm"
                onClick={toggleTheme}
              >
                <i
                  className={`bi ${
                    settings.theme === "light" ? "bi-moon" : "bi-sun"
                  }`}
                ></i>
              </Button>
            </OverlayTrigger>

            {/* High Contrast Toggle */}
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="contrast-tooltip">
                  {settings.highContrast
                    ? t("normal_contrast")
                    : t("high_contrast")}
                </Tooltip>
              }
            >
              <Button
                variant="outline-secondary"
                className={`me-2 ${settings.highContrast ? "active" : ""}`}
                size="sm"
                onClick={toggleHighContrast}
              >
                <i className="bi bi-circle-half"></i>
              </Button>
            </OverlayTrigger>

            {/* Settings Button */}
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="settings-tooltip">{t("adjust_settings")}</Tooltip>
              }
            >
              <Button
                variant="outline-secondary"
                onClick={() => setShowSettings(true)}
                size="sm"
              >
                <i className="bi bi-gear"></i>
              </Button>
            </OverlayTrigger>
          </div>
        </Container>
      </Navbar>

      <Container className="main-content py-4">
        <Row>
          <Col md={4} lg={3} className="d-none d-md-block">
            <Card className="mb-4 sidebar-card">
              <Card.Header>
                <Card.Title>{t("example_questions")}</Card.Title>
                <Card.Subtitle className="text-muted">
                  {t("click_question")}
                </Card.Subtitle>
              </Card.Header>
              <Card.Body>
                <ul className="example-questions">
                  {exampleQuestions.map((question, index) => (
                    <li key={index}>
                      <Button
                        variant="link"
                        className="text-start p-0 mb-2 w-100 example-question"
                        onClick={() => setQuery(question)}
                      >
                        {question}
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card.Body>
              <Card.Footer>
                <Button
                  variant="outline-secondary"
                  className="w-100"
                  onClick={clearChat}
                  disabled={!query && !answer}
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  {t("clear")}
                </Button>
              </Card.Footer>
            </Card>

            {/* Favourites section */}
            {favorites.length > 0 && (
              <Card className="sidebar-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <Card.Title>{t("saved_responses")}</Card.Title>
                  {favorites.length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-danger"
                      onClick={() => {
                        if (window.confirm(t("confirm_delete_all"))) {
                          localStorage.removeItem("auticonnect_favorites");
                          setFavorites([]);
                        }
                      }}
                    >
                      {t("clear_all")}
                    </Button>
                  )}
                </Card.Header>
                <ListGroup variant="flush">
                  {favorites.slice(0, 5).map((fav) => (
                    <ListGroup.Item
                      key={fav.id}
                      action
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div
                        className="text-truncate cursor-pointer"
                        onClick={() => {
                          setQuery(fav.question);
                          setAnswer(fav.answer);
                          setActiveTab("chat");
                        }}
                      >
                        {fav.question}
                      </div>
                      <Button
                        variant="link"
                        className="text-danger p-0 ms-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFavorite(fav.id);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                {favorites.length > 5 && (
                  <Card.Footer>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0"
                      onClick={() => setActiveTab("favorites")}
                    >
                      {t("view_all")}
                    </Button>
                  </Card.Footer>
                )}
              </Card>
            )}
          </Col>

          <Col md={8} lg={9}>
            <Tab.Container
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link eventKey="chat">{t("chat")}</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="favorites">
                    {t("saved_responses")}
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="chat">
                  <Alert id="save-success" variant="success" className="d-none">
                    {t("response_saved")}
                  </Alert>

                  <Card className="mb-4 primary-card">
                    <Card.Header>
                      <Card.Title>{t("ask_title")}</Card.Title>
                      <Card.Subtitle className="text-muted">
                        {t("ask_subtitle")}
                      </Card.Subtitle>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder={t("question_placeholder")}
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="query-textarea"
                        />
                      </Form.Group>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-between">
                      <Button
                        variant="outline-secondary"
                        onClick={clearChat}
                        disabled={!query && !answer}
                        className="d-none d-sm-block"
                      >
                        <i className="bi bi-arrow-repeat me-2"></i>
                        {t("clear")}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleQuery}
                        disabled={loading || !query.trim()}
                        className="submit-button"
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            {t("processing")}
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            {t("submit")}
                          </>
                        )}
                      </Button>
                    </Card.Footer>
                  </Card>

                  {answer && (
                    <Card className="answer-card">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <Card.Title className="d-flex align-items-center mb-0">
                          <i className="bi bi-stars me-2"></i>
                          {t("answer")}
                        </Card.Title>
                        <div>
                          <ButtonGroup size="sm" className="me-2">
                            {isSpeaking ? (
                              <Button
                                variant="outline-secondary"
                                onClick={stopSpeech}
                              >
                                <i className="bi bi-pause-fill me-1"></i>
                                {t("stop_reading")}
                              </Button>
                            ) : (
                              <Button
                                variant="outline-secondary"
                                onClick={() => speakText(answer)}
                              >
                                <i className="bi bi-volume-up me-1"></i>
                                {t("read_aloud")}
                              </Button>
                            )}
                          </ButtonGroup>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={handleSaveFavorite}
                          >
                            <i className="bi bi-bookmark-plus me-2"></i>
                            {t("save_response")}
                          </Button>
                        </div>
                      </Card.Header>
                      <Card.Body>
                        <div className="answer-content">
                          <p className="whitespace-pre-wrap">{answer}</p>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="favorites">
                  {favorites.length > 0 ? (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">{t("your_saved_responses")}</h5>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(t("confirm_delete_all"))) {
                              localStorage.removeItem("auticonnect_favorites");
                              setFavorites([]);
                            }
                          }}
                        >
                          <i className="bi bi-trash me-2"></i>
                          {t("delete_all")}
                        </Button>
                      </div>

                      {favorites.map((fav) => (
                        <Card key={fav.id} className="mb-3 favorite-card">
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <Card.Title className="mb-0">
                              {t("saved_response")}
                            </Card.Title>
                            <div>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                onClick={() => speakText(fav.answer)}
                              >
                                <i className="bi bi-volume-up"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteFavorite(fav.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </Card.Header>
                          <Card.Body>
                            <h6>{t("question")}:</h6>
                            <p>{fav.question}</p>
                            <h6>{t("answer")}:</h6>
                            <p className="whitespace-pre-wrap">{fav.answer}</p>
                          </Card.Body>
                          <Card.Footer className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {new Date(fav.timestamp).toLocaleString()}
                            </small>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setQuery(fav.question);
                                setAnswer(fav.answer);
                                setActiveTab("chat");
                              }}
                            >
                              <i className="bi bi-arrow-return-left me-1"></i>
                              {t("use_this")}
                            </Button>
                          </Card.Footer>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <Card className="text-center p-4">
                      <Card.Body>
                        <p className="text-muted">{t("no_saved_responses")}</p>
                      </Card.Body>
                    </Card>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>
      </Container>

      <footer className="footer mt-auto py-3">
        <Container className="text-center">
          <p className="text-muted mb-0">{t("footer_text")}</p>
        </Container>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        show={showSettings}
        onHide={() => setShowSettings(false)}
        settings={settings}
        setSettings={setSettings}
        t={t}
      />
    </div>
  );
}

export default App;

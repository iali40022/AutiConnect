"use client";

import { useState, useEffect } from "react";
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
} from "react-bootstrap";
import "./App.css";
import SettingsModal from "./components/SettingsModal";
import {
  getFavorites,
  saveResponse,
  deleteFavorite,
  getSettings,
} from "./utils/storage";

function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  // Simplified personalization states
  const [showSettings, setShowSettings] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [settings, setSettings] = useState({
    fontSize: "medium",
  });

  // Load personalization data on component mount
  useEffect(() => {
    const loadedFavorites = getFavorites();
    setFavorites(loadedFavorites);

    const loadedSettings = getSettings();
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
  }, []);

  // Apply font size setting
  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize =
      settings.fontSize === "small"
        ? "14px"
        : settings.fontSize === "large"
        ? "18px"
        : "16px";
  }, [settings]);

  const handleQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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

  // Add delete functionality
  const handleDeleteFavorite = (id) => {
    deleteFavorite(id);
    setFavorites(favorites.filter((fav) => fav.id !== id));
  };

  const exampleQuestions = [
    "What are effective communication strategies for non-verbal autistic children?",
    "How can I help my child with sensory overload in public places?",
    "What are some visual supports I can create at home?",
    "How do I establish a consistent routine for my autistic child?",
    "What strategies can help with meltdowns?",
  ];

  return (
    <div className="app-container">
      <Navbar bg="light" expand="lg" className="navbar-custom">
        <Container>
          <Navbar.Brand href="#home" className="brand">
            <i className="bi bi-stars me-2"></i>
            <span className="gradient-text">AutiConnect</span>
          </Navbar.Brand>

          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="settings-tooltip">Adjust font size</Tooltip>}
          >
            <Button
              variant="outline-dark"
              onClick={() => setShowSettings(true)}
            >
              <i className="bi bi-gear"></i>
            </Button>
          </OverlayTrigger>
        </Container>
      </Navbar>

      <Container className="main-content py-4">
        <Row>
          <Col md={4} lg={3} className="d-none d-md-block">
            <Card className="mb-4 sidebar-card">
              <Card.Header>
                <Card.Title>Example Questions</Card.Title>
                <Card.Subtitle className="text-muted">
                  Click on any question to get started
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
                  Clear
                </Button>
              </Card.Footer>
            </Card>

            {/* Favorites section */}
            {favorites.length > 0 && (
              <Card className="sidebar-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <Card.Title>Saved Responses</Card.Title>
                  {favorites.length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 text-danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete all saved responses?"
                          )
                        ) {
                          localStorage.removeItem("auticonnect_favorites");
                          setFavorites([]);
                        }
                      }}
                    >
                      Clear All
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
                      View all saved responses
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
                  <Nav.Link eventKey="chat">Chat</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="favorites">Saved Responses</Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="chat">
                  <Alert id="save-success" variant="success" className="d-none">
                    Response saved successfully!
                  </Alert>

                  <Card className="mb-4 primary-card">
                    <Card.Header>
                      <Card.Title>Ask About Autism Support</Card.Title>
                      <Card.Subtitle className="text-muted">
                        Ask any question about autism support, behavior
                        management, or communication strategies
                      </Card.Subtitle>
                    </Card.Header>
                    <Card.Body>
                      <Form.Group>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Enter your question here..."
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
                        Clear
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
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Submit
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
                          Answer
                        </Card.Title>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handleSaveFavorite}
                        >
                          <i className="bi bi-bookmark-plus me-2"></i>
                          Save Response
                        </Button>
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
                        <h5 className="mb-0">Your Saved Responses</h5>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete all saved responses?"
                              )
                            ) {
                              localStorage.removeItem("auticonnect_favorites");
                              setFavorites([]);
                            }
                          }}
                        >
                          <i className="bi bi-trash me-2"></i>
                          Delete All
                        </Button>
                      </div>

                      {favorites.map((fav) => (
                        <Card key={fav.id} className="mb-3 favorite-card">
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <Card.Title className="mb-0">
                              Saved Response
                            </Card.Title>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteFavorite(fav.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </Card.Header>
                          <Card.Body>
                            <h6>Question:</h6>
                            <p>{fav.question}</p>
                            <h6>Answer:</h6>
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
                              Use This
                            </Button>
                          </Card.Footer>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <Card className="text-center p-4">
                      <Card.Body>
                        <p className="text-muted">
                          No saved responses yet. Click "Save Response" on any
                          answer to save it here.
                        </p>
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
          <p className="text-muted mb-0">
            AutiConnect - Supporting parents and carers of children with autism
          </p>
        </Container>
      </footer>

      {/* Settings Modal - Simplified */}
      <SettingsModal
        show={showSettings}
        onHide={() => setShowSettings(false)}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}

export default App;

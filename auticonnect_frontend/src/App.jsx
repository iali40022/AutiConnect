"use client";

import { useState } from "react";
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
} from "react-bootstrap";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");

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

      // Add to chat history
      setChatHistory([...chatHistory, { question: query, answer: newAnswer }]);
    } catch (err) {
      setAnswer("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const clearChat = () => {
    setChatHistory([]);
    setQuery("");
    setAnswer("");
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
            overlay={
              <Tooltip id="about-tooltip">
                AutiConnect helps parents and carers of children with autism
                with behavior management and communication strategies.
              </Tooltip>
            }
          >
            <Button variant="link" className="info-button">
              <i className="bi bi-info-circle"></i>
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
                  disabled={chatHistory.length === 0}
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Clear Chat
                </Button>
              </Card.Footer>
            </Card>
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
                  <Nav.Link eventKey="history">History</Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="chat">
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
                        disabled={chatHistory.length === 0}
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
                      <Card.Header>
                        <Card.Title className="d-flex align-items-center">
                          <i className="bi bi-stars me-2"></i>
                          Answer
                        </Card.Title>
                      </Card.Header>
                      <Card.Body>
                        <div className="answer-content">
                          <p className="whitespace-pre-wrap">{answer}</p>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="history">
                  {chatHistory.length > 0 ? (
                    chatHistory.map((chat, index) => (
                      <Card
                        key={index}
                        className={`mb-3 ${
                          index % 2 === 0 ? "question-card" : "answer-card"
                        }`}
                      >
                        <Card.Header>
                          <Card.Title>
                            {index % 2 === 0 ? "Question" : "Answer"}
                          </Card.Title>
                        </Card.Header>
                        <Card.Body>
                          <p className="whitespace-pre-wrap">
                            {index % 2 === 0 ? chat.question : chat.answer}
                          </p>
                        </Card.Body>
                      </Card>
                    ))
                  ) : (
                    <Card className="text-center p-4">
                      <Card.Body>
                        <p className="text-muted">
                          No chat history yet. Start a conversation to see your
                          history here.
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
    </div>
  );
}

export default App;

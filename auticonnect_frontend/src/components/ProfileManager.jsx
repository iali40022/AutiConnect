"use client";

import { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Badge,
  Card,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { saveProfile, deleteProfile } from "../utils/storage";

const ProfileManager = ({
  show,
  onHide,
  profiles,
  setProfiles,
  activeProfile,
  setActiveProfile,
}) => {
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: "",
    age: "",
    challenges: [],
    interests: [],
  });
  const [editingProfile, setEditingProfile] = useState(null);

  const commonChallenges = [
    "Communication difficulties",
    "Sensory sensitivities",
    "Social interaction",
    "Repetitive behaviors",
    "Transitions/changes",
    "Emotional regulation",
    "Sleep issues",
    "Food selectivity",
    "Attention/focus",
  ];

  const handleSaveProfile = () => {
    if (!newProfile.name.trim()) return;

    const profileToSave = {
      ...newProfile,
      id: editingProfile ? editingProfile.id : Date.now().toString(),
      challenges: newProfile.challenges.filter((c) => c.trim()),
      interests: newProfile.interests.filter((i) => i.trim()),
    };

    saveProfile(profileToSave);

    if (editingProfile) {
      setProfiles(
        profiles.map((p) => (p.id === profileToSave.id ? profileToSave : p))
      );
    } else {
      setProfiles([...profiles, profileToSave]);
    }

    resetForm();
  };

  const handleDeleteProfile = (id) => {
    deleteProfile(id);
    setProfiles(profiles.filter((p) => p.id !== id));

    if (activeProfile && activeProfile.id === id) {
      setActiveProfile(null);
    }
  };

  const handleSetActive = (profile) => {
    setActiveProfile(profile);
    setActiveProfile(profile.id);
    onHide();
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setNewProfile({
      name: profile.name,
      age: profile.age || "",
      challenges: profile.challenges || [],
      interests: profile.interests || [],
    });
    setShowNewProfile(true);
  };

  const resetForm = () => {
    setNewProfile({
      name: "",
      age: "",
      challenges: [],
      interests: [],
    });
    setEditingProfile(null);
    setShowNewProfile(false);
  };

  const handleChallengeToggle = (challenge) => {
    if (newProfile.challenges.includes(challenge)) {
      setNewProfile({
        ...newProfile,
        challenges: newProfile.challenges.filter((c) => c !== challenge),
      });
    } else {
      setNewProfile({
        ...newProfile,
        challenges: [...newProfile.challenges, challenge],
      });
    }
  };

  const handleAddCustomChallenge = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      if (!newProfile.challenges.includes(e.target.value.trim())) {
        setNewProfile({
          ...newProfile,
          challenges: [...newProfile.challenges, e.target.value.trim()],
        });
      }
      e.target.value = "";
    }
  };

  const handleAddCustomInterest = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      if (!newProfile.interests.includes(e.target.value.trim())) {
        setNewProfile({
          ...newProfile,
          interests: [...newProfile.interests, e.target.value.trim()],
        });
      }
      e.target.value = "";
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-person-circle me-2"></i>
          Child Profiles
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {showNewProfile ? (
          <Form>
            <h5>{editingProfile ? "Edit Profile" : "Create New Profile"}</h5>
            <Form.Group className="mb-3">
              <Form.Label>Child's Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={newProfile.name}
                onChange={(e) =>
                  setNewProfile({ ...newProfile, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Age (Optional)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter age"
                value={newProfile.age}
                onChange={(e) =>
                  setNewProfile({ ...newProfile, age: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Areas of Focus</Form.Label>
              <div className="mb-2">
                {commonChallenges.map((challenge) => (
                  <Badge
                    key={challenge}
                    bg={
                      newProfile.challenges.includes(challenge)
                        ? "primary"
                        : "secondary"
                    }
                    className="me-2 mb-2 p-2 challenge-badge"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleChallengeToggle(challenge)}
                  >
                    {challenge}
                    {newProfile.challenges.includes(challenge) && (
                      <i className="bi bi-check ms-1"></i>
                    )}
                  </Badge>
                ))}
              </div>
              <Form.Control
                type="text"
                placeholder="Type custom area and press Enter"
                onKeyDown={handleAddCustomChallenge}
              />
              {newProfile.challenges.length > 0 && (
                <div className="mt-2">
                  <strong>Selected areas:</strong>{" "}
                  {newProfile.challenges.join(", ")}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Interests (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Type interest and press Enter"
                onKeyDown={handleAddCustomInterest}
              />
              {newProfile.interests.length > 0 && (
                <div className="mt-2">
                  <strong>Added interests:</strong>{" "}
                  {newProfile.interests.join(", ")}
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveProfile}>
                {editingProfile ? "Update Profile" : "Save Profile"}
              </Button>
            </div>
          </Form>
        ) : (
          <>
            {profiles.length > 0 ? (
              <Row>
                {profiles.map((profile) => (
                  <Col md={6} key={profile.id} className="mb-3">
                    <Card
                      className={
                        activeProfile && activeProfile.id === profile.id
                          ? "border-primary"
                          : ""
                      }
                    >
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0">{profile.name}</h6>
                        {activeProfile && activeProfile.id === profile.id && (
                          <Badge bg="primary">Active</Badge>
                        )}
                      </Card.Header>
                      <Card.Body>
                        {profile.age && (
                          <p className="mb-2">
                            <strong>Age:</strong> {profile.age}
                          </p>
                        )}

                        {profile.challenges &&
                          profile.challenges.length > 0 && (
                            <div className="mb-2">
                              <strong>Areas of Focus:</strong>
                              <div>
                                {profile.challenges.map((challenge) => (
                                  <Badge
                                    key={challenge}
                                    bg="info"
                                    className="me-1 mb-1"
                                  >
                                    {challenge}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {profile.interests && profile.interests.length > 0 && (
                          <div>
                            <strong>Interests:</strong>
                            <div>
                              {profile.interests.map((interest) => (
                                <Badge
                                  key={interest}
                                  bg="secondary"
                                  className="me-1 mb-1"
                                >
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card.Body>
                      <Card.Footer className="d-flex justify-content-between">
                        <div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteProfile(profile.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="ms-2"
                            onClick={() => handleEditProfile(profile)}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                        </div>

                        <Button
                          variant={
                            activeProfile && activeProfile.id === profile.id
                              ? "outline-primary"
                              : "primary"
                          }
                          size="sm"
                          onClick={() => handleSetActive(profile)}
                          disabled={
                            activeProfile && activeProfile.id === profile.id
                          }
                        >
                          {activeProfile && activeProfile.id === profile.id
                            ? "Active"
                            : "Set Active"}
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                No profiles created yet. Create a profile to personalize
                responses for your child.
              </Alert>
            )}

            <div className="d-flex justify-content-center mt-3">
              <Button variant="primary" onClick={() => setShowNewProfile(true)}>
                <i className="bi bi-plus-circle me-2"></i>
                Create New Profile
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ProfileManager;

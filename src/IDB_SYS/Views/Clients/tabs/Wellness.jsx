import React, { useState } from "react";
import {
  Form,
  Button,
  Table,
  Badge,
  Modal,
  Alert,
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";
import { FaHeartbeat, FaChartLine, FaClipboardList } from "react-icons/fa";

const Wellness = ({ formik }) => {
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [trendQuestion, setTrendQuestion] = useState(null);
  const [editingResponse, setEditingResponse] = useState(null);

  // Sample wellness questions grouped by category
  const wellnessGroups = [
    {
      name: "Vital Signs",
      questions: [
        { id: 1, question: "Blood Pressure", type: "text", unit: "mmHg" },
        { id: 2, question: "Heart Rate", type: "number", unit: "bpm" },
        { id: 3, question: "Temperature", type: "number", unit: "°F" },
      ],
    },
    {
      name: "Mobility",
      questions: [
        {
          id: 4,
          question: "Walking Ability",
          type: "scale",
          options: ["Unable", "With Assistance", "Independent"],
        },
        {
          id: 5,
          question: "Transfer Ability",
          type: "scale",
          options: ["Dependent", "Partial Assist", "Independent"],
        },
      ],
    },
    {
      name: "Nutrition",
      questions: [
        {
          id: 6,
          question: "Appetite",
          type: "scale",
          options: ["Poor", "Fair", "Good", "Excellent"],
        },
        { id: 7, question: "Fluid Intake", type: "text", unit: "cups/day" },
      ],
    },
  ];

  // Get all questions flattened
  const allQuestions = wellnessGroups.flatMap((group) =>
    group.questions.map((q) => ({ ...q, group: group.name }))
  );

  const filteredQuestions =
    selectedGroup === "All"
      ? allQuestions
      : allQuestions.filter((q) => q.group === selectedGroup);

  const handleResponseChange = (questionId, value) => {
    // Create or update the response
    formik.setFieldValue(`wellnessResponses.${questionId}`, {
      ...formik.values.wellnessResponses?.[questionId],
      value,
      date: new Date().toISOString(),
    });
  };

  const saveAssessment = () => {
    // Save current responses to history
    const responsesToSave = Object.entries(
      formik.values.wellnessResponses || {}
    )
      .filter(([_, response]) => response?.value)
      .map(([questionId, response]) => ({
        questionId: parseInt(questionId),
        value: response.value,
        date: response.date,
        notes: response.notes || "",
      }));

    const newHistory = [
      ...(formik.values.wellnessHistory || []),
      ...responsesToSave,
    ];

    formik.setFieldValue("wellnessHistory", newHistory);
    setShowAssessmentModal(false);
    setCurrentQuestion(null);
  };

  const getResponseHistory = (questionId) => {
    return (
      formik.values.wellnessHistory
        ?.filter((item) => item.questionId === questionId)
        ?.sort((a, b) => new Date(b.date) - new Date(a.date)) || []
    );
  };

  const calculateTrend = (questionId) => {
    const history = getResponseHistory(questionId);
    if (history.length < 2) return "stable";

    const lastValue = history[0].value;
    const prevValue = history[1].value;

    if (typeof lastValue === "number" && typeof prevValue === "number") {
      return lastValue > prevValue
        ? "improving"
        : lastValue < prevValue
        ? "declining"
        : "stable";
    }

    // For scale options, compare positions
    const question = allQuestions.find((q) => q.id === questionId);
    if (question?.type === "scale" && question.options) {
      const lastIndex = question.options.indexOf(lastValue);
      const prevIndex = question.options.indexOf(prevValue);

      if (lastIndex > prevIndex) return "improving";
      if (lastIndex < prevIndex) return "declining";
    }

    return "stable";
  };

  const renderResponseInput = (question, response = null) => {
    const currentValue =
      response?.value || formik.values.wellnessResponses?.[question.id]?.value;

    switch (question.type) {
      case "scale":
        return (
          <div>
            {question.options.map((option, i) => (
              <Button
                key={i}
                variant={
                  currentValue === option ? "primary" : "outline-primary"
                }
                size="sm"
                className="me-2 mb-2"
                onClick={() => handleResponseChange(question.id, option)}
              >
                {option}
              </Button>
            ))}
          </div>
        );
      case "number":
        return (
          <div className="d-flex align-items-center">
            <Form.Control
              type="number"
              value={currentValue || ""}
              onChange={(e) =>
                handleResponseChange(question.id, e.target.value)
              }
              style={{ width: "100px" }}
              className="me-2"
            />
            <span>{question.unit}</span>
          </div>
        );
      case "text":
        return (
          <Form.Control
            type="text"
            value={currentValue || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={`Enter ${question.unit ? question.unit : "response"}`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="wellness-tab">
      <h3>Wellness Assessment</h3>
      <p className="text-muted">
        Track and monitor client health indicators and wellness metrics.
      </p>
      {formik.errors.wellnessResponses && (
        <Alert variant="danger" className="mt-3">
          {formik.errors.wellnessResponses}
        </Alert>
      )}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="All">All Categories</option>
            {wellnessGroups.map((group) => (
              <option key={group.name} value={group.name}>
                {group.name}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={6} className="text-end">
          <Button
            variant="primary"
            onClick={() => {
              setCurrentQuestion(null);
              setShowAssessmentModal(true);
            }}
          >
            <FaClipboardList className="me-2" />
            New Assessment
          </Button>
        </Col>
      </Row>

      <div className="wellness-questions">
        {filteredQuestions.length === 0 ? (
          <Alert variant="info">
            No wellness questions found for the selected category.
          </Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Question</th>
                <th>Current Response</th>
                <th>Trend</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.map((question) => {
                const history = getResponseHistory(question.id);
                const latestResponse = history[0];
                const trend = calculateTrend(question.id);

                return (
                  <tr key={question.id}>
                    <td>{question.question}</td>
                    <td>
                      {latestResponse ? (
                        <div className="d-flex align-items-center">
                          <span className="me-2">
                            {latestResponse.value} {question.unit || ""}
                          </span>
                          {question.type === "scale" && (
                            <ProgressBar
                              now={
                                (question.options.indexOf(
                                  latestResponse.value
                                ) +
                                  1) *
                                (100 / question.options.length)
                              }
                              style={{ width: "100px", height: "10px" }}
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">No response</span>
                      )}
                    </td>
                    <td>
                      {history.length > 1 ? (
                        <Badge
                          bg={
                            trend === "improving"
                              ? "success"
                              : trend === "declining"
                              ? "danger"
                              : "info"
                          }
                        >
                          {trend}
                        </Badge>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>
                      {latestResponse ? (
                        new Date(latestResponse.date).toLocaleDateString()
                      ) : (
                        <span className="text-muted">Never</span>
                      )}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setCurrentQuestion(question);
                          setEditingResponse(
                            latestResponse || {
                              questionId: question.id,
                              value: "",
                              date: new Date().toISOString(),
                              notes: "",
                            }
                          );
                          setShowAssessmentModal(true);
                        }}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        className="ms-2"
                        onClick={() => {
                          setTrendQuestion(question);
                          setShowTrendModal(true);
                        }}
                        disabled={history.length < 2}
                      >
                        <FaChartLine />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </div>

      {/* Assessment Modal */}
      <Modal
        show={showAssessmentModal}
        onHide={() => setShowAssessmentModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentQuestion
              ? `Update ${currentQuestion.question}`
              : "New Wellness Assessment"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentQuestion ? (
            <div>
              <h5>{currentQuestion.question}</h5>
              <div className="my-3">
                {renderResponseInput(currentQuestion, editingResponse)}
              </div>
              <div className="mt-4">
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={
                      editingResponse?.notes ||
                      formik.values.wellnessResponses?.[currentQuestion.id]
                        ?.notes ||
                      ""
                    }
                    onChange={(e) => {
                      formik.setFieldValue(
                        `wellnessResponses.${currentQuestion.id}.notes`,
                        e.target.value
                      );
                    }}
                    placeholder="Additional notes about this assessment..."
                  />
                </Form.Group>
              </div>
            </div>
          ) : (
            <div>
              {wellnessGroups.map((group) => (
                <div key={group.name} className="mb-4">
                  <h5>{group.name}</h5>
                  {group.questions.map((question) => (
                    <div key={question.id} className="mb-3">
                      <Form.Label>{question.question}</Form.Label>
                      {renderResponseInput(question)}
                      <Form.Control
                        as="textarea"
                        rows={2}
                        className="mt-2"
                        value={
                          formik.values.wellnessResponses?.[question.id]
                            ?.notes || ""
                        }
                        onChange={(e) => {
                          formik.setFieldValue(
                            `wellnessResponses.${question.id}.notes`,
                            e.target.value
                          );
                        }}
                        placeholder="Notes..."
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAssessmentModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={saveAssessment}
            disabled={
              !Object.keys(formik.values.wellnessResponses || {}).some(
                (key) => formik.values.wellnessResponses[key]?.value
              )
            }
          >
            Save Assessment
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Trend Modal */}
      <Modal
        show={showTrendModal}
        onHide={() => setShowTrendModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{trendQuestion?.question} Trend</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {trendQuestion && (
            <div>
              <h5 className="text-center mb-4">{trendQuestion.question}</h5>

              <div className="trend-visualization mb-4">
                {getResponseHistory(trendQuestion.id).map((record, i) => (
                  <div key={i} className="trend-item mb-3 p-2 border rounded">
                    <div className="d-flex justify-content-between">
                      <strong>
                        {new Date(record.date).toLocaleDateString()}
                      </strong>
                      <span>
                        {record.value} {trendQuestion.unit || ""}
                      </span>
                    </div>
                    {i > 0 && (
                      <div
                        className={`text-${
                          calculateTrend(trendQuestion.id) === "improving"
                            ? "success"
                            : calculateTrend(trendQuestion.id) === "declining"
                            ? "danger"
                            : "muted"
                        }`}
                      >
                        {typeof record.value === "number" &&
                        typeof getResponseHistory(trendQuestion.id)[i - 1]
                          .value === "number"
                          ? record.value >
                            getResponseHistory(trendQuestion.id)[i - 1].value
                            ? "↑ Improved"
                            : record.value <
                              getResponseHistory(trendQuestion.id)[i - 1].value
                            ? "↓ Declined"
                            : "→ No change"
                          : "→ No change"}
                      </div>
                    )}
                    {record.notes && (
                      <div className="small text-muted mt-1">
                        <strong>Notes:</strong> {record.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="trend-summary p-3 bg-light rounded">
                <h6>Summary</h6>
                <ul className="mb-0">
                  <li>
                    <strong>First Recorded:</strong>{" "}
                    {new Date(
                      getResponseHistory(trendQuestion.id).slice(-1)[0].date
                    ).toLocaleDateString()}{" "}
                    - {getResponseHistory(trendQuestion.id).slice(-1)[0].value}{" "}
                    {trendQuestion.unit || ""}
                  </li>
                  <li>
                    <strong>Most Recent:</strong>{" "}
                    {new Date(
                      getResponseHistory(trendQuestion.id)[0].date
                    ).toLocaleDateString()}{" "}
                    - {getResponseHistory(trendQuestion.id)[0].value}{" "}
                    {trendQuestion.unit || ""}
                  </li>
                  <li>
                    <strong>Overall Trend:</strong>{" "}
                    <Badge
                      bg={
                        calculateTrend(trendQuestion.id) === "improving"
                          ? "success"
                          : calculateTrend(trendQuestion.id) === "declining"
                          ? "danger"
                          : "info"
                      }
                    >
                      {calculateTrend(trendQuestion.id)}
                    </Badge>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTrendModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Wellness;

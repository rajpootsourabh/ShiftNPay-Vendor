import React, { useState, useEffect } from 'react';
import { useField, FieldArray } from 'formik';
import { Form, Button, Table, Badge, Modal, Accordion, Row, Col } from 'react-bootstrap';
import { FaSearch, FaFilter, FaStickyNote, FaEdit, FaTrash } from 'react-icons/fa';

const Notes = ({ formik, clientData }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [newNote, setNewNote] = useState({
    category: '',
    priority: '',
    content: ''
  });

  // Initialize notes from API when clientData is available
  useEffect(() => {
    if (clientData && clientData.notes && Array.isArray(clientData.notes)) {
      formik.setFieldValue('notes', clientData.notes);
    }
  }, [clientData, formik.setFieldValue]);

  const noteCategories = [
    'General',
    'Medical',
    'Behavioral',
    'Family',
    'Administrative',
    'Other'
  ];

  const handleAddNote = (note) => {
    formik.setFieldValue('notes', [
      {
        ...note,
        date: new Date().toISOString(),
        enteredBy: 'Current User',
        id: Date.now()
      },
      ...formik.values.notes
    ]);
    setShowAddModal(false);
    setNewNote({ category: '', priority: '', content: '' }); // Reset form
  };

  const handleEditNote = (updatedNote) => {
    const updatedNotes = formik.values.notes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    formik.setFieldValue('notes', updatedNotes);
    setEditingNote(null);
  };

  const filteredNotes = (formik.values.notes || []).filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || note.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All' || note.category === categoryFilter;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  return (
    <div className="notes-tab">
      <h3>Client Notes</h3>
      <p className="text-muted">
        Document important observations, updates, and information about the client.
      </p>

      <Row className="mb-3">
        <Col md={6}>
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
          >
            <FaStickyNote className="me-2" />
            Add New Note
          </Button>
        </Col>
        <Col md={6}>
          <div className="d-flex">
            <div className="input-group me-2">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <Form.Control
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="btn-group">
              <Button
                variant="outline-secondary"
                title="Filter by priority"
                onClick={() => setPriorityFilter(priorityFilter === 'All' ? 'High' : priorityFilter === 'High' ? 'Medium' : priorityFilter === 'Medium' ? 'Low' : 'All')}
              >
                <FaFilter className="me-1" />
                {priorityFilter === 'All' ? 'Priority' : priorityFilter}
              </Button>
              <Button
                variant="outline-secondary"
                title="Filter by category"
                onClick={() => {
                  const currentIndex = noteCategories.findIndex(cat => cat === categoryFilter);
                  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % (noteCategories.length + 1);
                  setCategoryFilter(nextIndex === noteCategories.length ? 'All' : noteCategories[nextIndex]);
                }}
              >
                <FaFilter className="me-1" />
                {categoryFilter === 'All' ? 'Category' : categoryFilter}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <FieldArray name="notes">
        {({ remove }) => (
          <div className="notes-list">
            {(!filteredNotes || filteredNotes.length === 0) ? (
              <div className="alert alert-info">
                No notes found. Create your first note by clicking "Add New Note".
              </div>
            ) : (
              <Accordion defaultActiveKey="0" alwaysOpen>
                {filteredNotes.map((note, index) => (
                  <Accordion.Item key={note.id || index} eventKey={index.toString()}>
                    <Accordion.Header>
                      <div className="d-flex w-100 align-items-center">
                        <div className="flex-grow-1">
                          <Badge 
                            bg={
                              note.priority === 'High' ? 'danger' :
                              note.priority === 'Medium' ? 'warning' :
                              'primary'
                            }
                            className="me-2"
                          >
                            {note.priority}
                          </Badge>
                          <Badge bg="info" className="me-2">
                            {note.category}
                          </Badge>
                          {note.content && note.content.substring(0, 60)}{note.content && note.content.length > 60 ? '...' : ''}
                        </div>
                        <div className="text-muted small">
                          {note.date ? new Date(note.date).toLocaleDateString() : 'No date'} by {note.enteredBy || 'Unknown'}
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="mb-3">
                        <Row>
                          <Col md={3}>
                            <div className="text-muted small">Category</div>
                            <div>{note.category}</div>
                          </Col>
                          <Col md={3}>
                            <div className="text-muted small">Priority</div>
                            <div>{note.priority}</div>
                          </Col>
                          <Col md={3}>
                            <div className="text-muted small">Date</div>
                            <div>{note.date ? new Date(note.date).toLocaleString() : 'No date'}</div>
                          </Col>
                          <Col md={3}>
                            <div className="text-muted small">Entered By</div>
                            <div>{note.enteredBy || 'Unknown'}</div>
                          </Col>
                        </Row>
                      </div>
                      <div className="mb-3">
                        <div className="text-muted small">Note Content</div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{note.content}</div>
                      </div>
                      <div className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => setEditingNote(note)}
                        >
                          <FaEdit className="me-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            const originalIndex = formik.values.notes.findIndex(n => n.id === note.id);
                            if (originalIndex !== -1) {
                              remove(originalIndex);
                            }
                          }}
                        >
                          <FaTrash className="me-1" />
                          Delete
                        </Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </div>
        )}
      </FieldArray>

      {/* Add Note Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Category*</Form.Label>
            <Form.Select
              name="category"
              value={newNote.category}
              onChange={(e) => setNewNote({...newNote, category: e.target.value})}
            >
              <option value="">Select category</option>
              {noteCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Priority*</Form.Label>
            <Form.Select
              name="priority"
              value={newNote.priority}
              onChange={(e) => setNewNote({...newNote, priority: e.target.value})}
            >
              <option value="">Select priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Note Content*</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="content"
              value={newNote.content}
              onChange={(e) => setNewNote({...newNote, content: e.target.value})}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (newNote.category && newNote.priority && newNote.content) {
                handleAddNote(newNote);
              }
            }}
          >
            Save Note
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Note Modal */}
      <Modal show={!!editingNote} onHide={() => setEditingNote(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingNote && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Category*</Form.Label>
                <Form.Select
                  name="category"
                  value={editingNote.category}
                  onChange={(e) => setEditingNote({...editingNote, category: e.target.value})}
                >
                  <option value="">Select category</option>
                  {noteCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Priority*</Form.Label>
                <Form.Select
                  name="priority"
                  value={editingNote.priority}
                  onChange={(e) => setEditingNote({...editingNote, priority: e.target.value})}
                >
                  <option value="">Select priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Note Content*</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="content"
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingNote(null)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (editingNote.category && editingNote.priority && editingNote.content) {
                handleEditNote(editingNote);
              }
            }}
          >
            Update Note
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Notes;
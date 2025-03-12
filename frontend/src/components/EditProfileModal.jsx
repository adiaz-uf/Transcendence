import React from 'react';
import { Form, Button, Modal } from 'react-bootstrap';

export default function EditProfileModal({ showModal, handleCloseModal, newName, setNewName, newEmail, setNewEmail, newUsername, setNewUsername, handleChangeData }) {
  return (
    <Modal show={showModal} onHide={handleCloseModal} dialogClassName="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleChangeData}>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter your name"
            />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </Form.Group>
          <Form.Group controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3 w-100">
            Save Changes
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
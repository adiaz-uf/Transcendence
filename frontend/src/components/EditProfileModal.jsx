import React from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import MessageBox from './MessageBox';
import { ACCESS_TOKEN } from "../constants"; 
import api from '../api';
import { useState } from 'react';

export default function EditProfileModal({ showModal, handleCloseModal,
  newEmail, setNewEmail, newUsername, newPassword, setNewPassword, setNewUsername}) {
  const [message, setMessage] = useState(null);

  const handleChangeData = async (e) => {
    e.preventDefault();
    const updatedData = {};
    if (newEmail) updatedData.email = newEmail;
    if (newUsername) updatedData.username = newUsername;
    if (newPassword) {
      updatedData.password = newPassword;
      setNewPassword(""); // Clean password wrote
    }
  
    // check empty form
    if (Object.keys(updatedData).length === 0) {
      setMessage("No changes were made.");
      return;
    }
    console.log(updatedData);
    try {
      const response = await api.post('/api/user/profile/', updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}` },
      });
      handleCloseModal();
    } catch (error) {
      console.log(error);
      setMessage(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <Modal show={showModal} onHide={handleCloseModal} dialogClassName="custom-modal">
      {message && (
      <MessageBox 
        message={message}
        type="error"
        onClose={() => setMessage(null)}/>
      )}
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleChangeData}>
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
          <Form.Group controlId="formPassword" >
            <Form.Label>New Password (blank for the old)</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
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
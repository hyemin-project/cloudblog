// Modal.js
import React from 'react';
import './css/Modal.css';

const Modal = ({ show, handleClose, message }) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={handleClose}></div>
      <div className="modal">
        <div className="modal-content">
          <p>{message}</p>
          <button onClick={handleClose}>Close</button>
        </div>
      </div>
    </>
  );
};

export default Modal;

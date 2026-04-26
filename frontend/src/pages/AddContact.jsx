import { useState } from 'react';
import api from '../api/api.js';

const AddContact = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/user/add-contact', {
        name,
        phoneNumber,
        email
      });
      setSuccess(response.data.message || 'Contact added successfully.');
      setName('');
      setPhoneNumber('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to add contact.');
    }
  };

  return (
    <div className="page-shell">
      <div className="card auth-panel" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div>
          <h1>Add Trusted Contact</h1>
          <p className="auth-intro">Save a contact who can be alerted instantly when your SOS is triggered.</p>
        </div>
        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email (optional)</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-footer">
            <button className="primary" type="submit">
              Add Contact
            </button>
            <span className="note">Only name and phone number are required.</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContact;

import { useState } from 'react';
import api from '../api/api.js';
import SOSButton from '../components/SOSButton.jsx';

const Dashboard = () => {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getLocationAndSend = () => {
    setError('');
    setStatus('');
    setResult(null);

    if (!message.trim()) {
      setError('Please enter your emergency message.');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('Getting location...');
    setIsSending(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus('Sending SOS...');
        try {
          const { latitude, longitude } = position.coords;
          const response = await api.post('/sos/trigger', {
            message,
            lat: latitude,
            lng: longitude
          });
          setResult(response.data.data);
          setStatus('SOS delivered successfully.');
        } catch (err) {
          setError(err.response?.data?.message || err.message || 'Unable to send SOS.');
          setStatus('');
        } finally {
          setIsSending(false);
        }
      },
      (geoError) => {
        setError('Unable to access location. Please allow location permissions.');
        setStatus('');
        setIsSending(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div className="page-shell">
      <div className="banner">
        <div className="card">
          <h1>Emergency Dashboard</h1>
          <p className="note">
            Enter a short emergency message and press the red SOS button to alert your trusted contacts.
          </p>
          {error && <div className="alert error">{error}</div>}
          {status && <div className="alert success">{status}</div>}
          <div className="form-group">
            <label htmlFor="sosMessage">Emergency message</label>
            <textarea
              id="sosMessage"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what is happening right now..."
            />
          </div>
          <SOSButton onClick={getLocationAndSend} disabled={!message.trim() || isSending} isSending={isSending} />
        </div>
      </div>

      {result && (
        <div className="result-block">
          <div className="card result-card">
            <h3>Safety Response</h3>
            <span className={`result-pill ${result.riskLevel || 'low'}`}>{result.riskLevel || 'low'}</span>
            <p style={{ marginTop: '18px', lineHeight: 1.75 }}>{result.advice}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

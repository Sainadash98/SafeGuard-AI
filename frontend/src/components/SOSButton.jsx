const SOSButton = ({ onClick, disabled, isSending }) => {
  return (
    <button className="primary" onClick={onClick} disabled={disabled}>
      {isSending ? 'Sending...' : 'Send SOS'}
    </button>
  );
};

export default SOSButton;

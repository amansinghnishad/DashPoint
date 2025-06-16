export const SessionWarningActions = ({ onExtendSession, onLogout }) => {
  return (
    <div className="flex space-x-3">
      <button
        onClick={onExtendSession}
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Stay Logged In
      </button>
      <button
        onClick={onLogout}
        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

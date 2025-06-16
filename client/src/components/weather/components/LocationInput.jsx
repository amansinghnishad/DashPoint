import { useState } from "react";

export const LocationInput = ({ onSubmit, onCancel }) => {
  const [location, setLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      onSubmit(location.trim());
      setLocation("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex space-x-2">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city name..."
          className="flex-1 px-3 py-2 bg-white/20 placeholder-white/70 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
          autoFocus
        />
        <button
          type="submit"
          className="px-4 py-2 bg-white/30 hover:bg-white/40 text-white rounded-lg font-medium transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

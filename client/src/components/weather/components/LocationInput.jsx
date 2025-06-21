import { useState } from "react";
import { Input, Button } from "../../ui";

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
        <Input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter city name..."
          className="flex-1 bg-white/20 placeholder-white/70 text-white border-white/30 focus:ring-white/50"
          autoFocus
        />
        <Button
          type="submit"
          variant="ghost"
          className="bg-white/30 hover:bg-white/40 text-white border-white/30"
        >
          Search
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

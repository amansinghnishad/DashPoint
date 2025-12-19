import { DEFAULT_COLORS } from "../utils/stickyNotesHelpers";

export const ColorPicker = ({ currentColor, onColorChange }) => {
  return (
    <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg p-2 z-10">
      <div className="grid grid-cols-4 gap-1">
        {DEFAULT_COLORS.map((color) => (
          <button
            key={color}
            onClick={(e) => {
              e.stopPropagation();
              onColorChange(color);
            }}
            className={`w-6 h-6 rounded border-2 ${
              currentColor === color ? "border-gray-800" : "border-gray-300"
            }`}
            style={{ backgroundColor: color }}
            title={`Color: ${color}`}
          />
        ))}
      </div>
    </div>
  );
};

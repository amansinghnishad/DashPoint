export const ShortcutCategory = ({ category, items }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        {category}
      </h3>
      <div className="space-y-2">
        {items.map((shortcut, index) => (
          <div
            key={index}
            className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
          >
            <span className="text-gray-700">{shortcut.action}</span>
            <div className="flex space-x-1">
              {shortcut.key.split(" + ").map((key, keyIndex) => (
                <span key={keyIndex}>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow">
                    {key}
                  </kbd>
                  {keyIndex < shortcut.key.split(" + ").length - 1 && (
                    <span className="mx-1 text-gray-500">+</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ShortcutCategory = ({ category, items }) => {
  return (
    <div className="mb-4 sm:mb-6 shortcut-category">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center">
        {category}
      </h3>
      <div className="space-y-1.5 sm:space-y-2">
        {items.map((shortcut, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-2 px-2 sm:px-3 bg-gray-50 rounded gap-1 sm:gap-0 shortcut-item touch-manipulation"
          >
            <span className="text-gray-700 text-sm sm:text-base font-medium sm:font-normal flex-1 min-w-0">
              {shortcut.action}
            </span>
            <div className="flex flex-wrap items-center space-x-1 flex-shrink-0">
              {shortcut.key.split(" + ").map((key, keyIndex) => (
                <span key={keyIndex} className="flex items-center">
                  <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow whitespace-nowrap">
                    {key}
                  </kbd>
                  {keyIndex < shortcut.key.split(" + ").length - 1 && (
                    <span className="mx-1 text-gray-500 text-xs sm:text-sm">
                      +
                    </span>
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

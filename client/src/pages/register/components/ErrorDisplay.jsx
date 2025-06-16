export const ErrorDisplay = ({ error, backendErrors }) => {
  if (!error && (!backendErrors || backendErrors.length === 0)) {
    return null;
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {backendErrors && backendErrors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium mb-2">
            Please fix the following errors:
          </p>
          <ul className="text-red-600 text-sm space-y-1">
            {backendErrors.map((err, index) => (
              <li key={index} className="flex items-center">
                <span className="mr-2">•</span>
                {err.msg || err.message || err}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

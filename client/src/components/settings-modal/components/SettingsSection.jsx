export const SettingsSection = ({ title, children }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

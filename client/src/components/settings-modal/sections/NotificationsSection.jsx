import { SettingsSection } from "../components/SettingsSection";
import { Toggle } from "../components/Toggle";

export const NotificationsSection = ({ settings, updateSetting }) => {
  const notificationLabels = {
    email: "Email",
    push: "Push",
    desktop: "Desktop",
    sound: "Sound",
  };

  return (
    <SettingsSection title="Notifications">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <Toggle
          key={key}
          enabled={value}
          onToggle={() => updateSetting("notifications", key, !value)}
          label={`${notificationLabels[key]} Notifications`}
          description={`Receive ${key} notifications`}
        />
      ))}
    </SettingsSection>
  );
};

import { Cloud, Sun, CloudRain, CloudSnow, Wind } from "lucide-react";

export const WeatherIcon = ({ condition, size = 48 }) => {
  const iconMap = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: CloudRain,
    snowy: CloudSnow,
    windy: Wind,
    clear: Sun,
    overcast: Cloud,
    "partly cloudy": Cloud,
    fog: Cloud,
    mist: Cloud,
  };

  const IconComponent = iconMap[condition?.toLowerCase()] || Cloud;

  return <IconComponent size={size} className="drop-shadow-lg" />;
};

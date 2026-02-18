import DashboardIcon from "../assets/DashboardIcon";
import EkycIcon from "../assets/EkycIcon";
import SettingsIcon from "../assets/SettingsIcon";

export const MERCHANT_MENU_ITEMS = [
  { label: "Dashboard", to: "/merchant/dashboard", icon: <DashboardIcon /> },
  { label: "Ekyc", to: "/merchant/ekyc", icon: <EkycIcon /> },
  { label: "Settings", to: "/settings", icon: <SettingsIcon /> },
];
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Heart,
  Image,
  Gift,
  Menu,
  X,
  Play,
} from "lucide-react";

const iconMap = {
  back: ArrowLeft,
  forward: ArrowRight,
  calendar: Calendar,
  heart: Heart,
  photo: Image,
  gift: Gift,
  menu: Menu,
  close: X,
  play: Play,
};

export function WeddingIcon({ name, className }) {
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
}

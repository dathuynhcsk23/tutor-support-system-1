import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import officialLogo from "@/assets/official_logo.png";
import officialLogoOutline from "@/assets/official_logo_outline.png";

interface LogoProps {
  className?: string;
  to?: string;
  showText?: boolean;
}

/**
 * Application logo component with optional text.
 * Switches between normal and outline logo based on theme.
 */
export default function Logo({
  className,
  to = "/",
  showText = true,
}: LogoProps) {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? officialLogoOutline : officialLogo;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 font-semibold text-foreground",
        className
      )}
    >
      <img src={logoSrc} alt="HCMUT Logo" className="h-15 w-auto" />
      {showText && <span className="text-lg">Tutor Support System</span>}
    </Link>
  );
}

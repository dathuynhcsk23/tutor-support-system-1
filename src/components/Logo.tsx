import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/official_logo.png";

interface LogoProps {
  className?: string;
  to?: string;
  showText?: boolean;
}

/**
 * Application logo component with optional text
 */
export default function Logo({
  className,
  to = "/",
  showText = true,
}: LogoProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2 font-semibold text-foreground",
        className
      )}
    >
      <img src={logoImage} alt="HCMUT Logo" className="h-10 w-auto" />
      {showText && <span className="text-lg">TSS</span>}
    </Link>
  );
}

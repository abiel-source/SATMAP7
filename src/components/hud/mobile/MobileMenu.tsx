import Link from "next/link";
import { NAV, PAGES_NAV } from "@/lib/menu/menu";

interface MobileMenuProps {
  isTrackerClient: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isTrackerClient, onClose }: MobileMenuProps) => {
  return (
    <div>
      <div className="flex flex-col items-center gap-2.5">
        {/* w-full automatically takes up w-52 */}
        {(isTrackerClient ? NAV : PAGES_NAV).map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="bg-space-900/90 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-colors text-[10px] tracking-[0.2em] uppercase px-4 py-3 w-full text-center"
          >
            [{label}]
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileMenu;

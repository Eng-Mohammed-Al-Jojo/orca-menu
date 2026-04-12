import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Category } from "./Menu";
import { FaThLarge } from "react-icons/fa";

interface Props {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export default function CategoryNavigation({
  categories,
  activeId,
  onSelect,
}: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // 🔥 Auto scroll to active tab (center)
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeId]);

  return (
    <div className="relative mb-8 sm:mb-12">

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="overflow-x-auto no-scrollbar pb-4 overscroll-x-contain"
      >
        <div className="flex items-center gap-3 px-4 min-w-max">

          {/* 🟦 ALL TAB (icon only) */}
          <TabButton
            id="all"
            label={t("common.all") || "All"}
            isActive={activeId === "all"}
            onClick={() => onSelect("all")}
            isAll
            refProp={activeId === "all" ? activeRef : null}
          />

          {/* 🔵 Categories */}
          {categories.map((cat) => (
            <TabButton
              key={cat.id}
              id={cat.id}
              label={cat.nameAr || cat.name}
              isActive={activeId === cat.id}
              onClick={() => onSelect(cat.id)}
              refProp={activeId === cat.id ? activeRef : null}
            />
          ))}

        </div>
      </div>

      {/* Gradient edges */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-linear-to-l from-(--menu-bg) to-transparent lg:hidden" />
      <div className="pointer-events-none absolute top-0 left-0 h-full w-8 bg-linear-to-r from-(--menu-bg) to-transparent lg:hidden" />

    </div>
  );
}

/* =========================
   TAB BUTTON
========================= */

interface TabButtonProps {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isAll?: boolean;
  refProp?: React.Ref<HTMLButtonElement> | null;
}

function TabButton({
  label,
  isActive,
  onClick,
  isAll,
  refProp,
}: TabButtonProps) {
  return (
    <button
      ref={refProp || null}
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-5 py-3 rounded-2xl
        text-xs font-black whitespace-nowrap
        transition-all duration-200 snap-start

        ${isActive
          ? "text-white"
          : "text-(--menu-text-muted) bg-(--menu-card-bg)/40 border border-(--menu-border)"
        }
      `}
    >
      <span className="relative z-10 flex items-center gap-2">

        {/* 🟦 ALL ICON */}
        {isAll ? (
          <FaThLarge size={12} />
        ) : (
          /* 🔵 CATEGORY DOT */
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
        )}

        {label}
      </span>

      {/* Active pill animation */}
      {isActive && (
        <motion.div
          layoutId="activeTabPill"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          className="absolute inset-0 bg-primary rounded-2xl shadow-lg shadow-secondary/25"
        />
      )}
    </button>
  );
}
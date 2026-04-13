import React, {
  useCallback,
  useRef,
  useState,
  useLayoutEffect
} from "react";
import { type Item } from "./Menu";
import { FaFire } from "react-icons/fa";
import { FiInfo, FiShoppingCart } from "react-icons/fi";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Props {
  item: Item;
  orderSystem: boolean;
  onClick?: (item: Item) => void;
  onDetailsClick?: (item: Item) => void;
}

const ItemRow = React.memo(
  ({ item, orderSystem, onClick, onDetailsClick }: Props) => {
    const { t } = useTranslation();

    const prices = String(item.price).split(",");
    const basePrice = Number(prices[0]);

    const unavailable = item.visible === false;

    const itemName = item.nameAr || item.name || "";
    const description = item.ingredientsAr || item.ingredients || "";

    const hasDetails = Boolean(
      item.ingredientsAr ||
      item.ingredients ||
      item.ingredientsEn ||
      (item as any).components?.length
    );

    const canOrder = !unavailable && orderSystem;

    // =========================
    // Overflow detection (2 lines)
    // =========================
    const descRef = useRef<HTMLParagraphElement>(null);
    const [showDetailsHint, setShowDetailsHint] = useState(false);

    useLayoutEffect(() => {
      const el = descRef.current;
      if (!el) return;

      setShowDetailsHint(el.scrollHeight > el.clientHeight);
    }, [description]);

    // =========================
    // Handlers
    // =========================
    const handleOrderClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (canOrder) onClick?.(item);
      },
      [canOrder, item, onClick]
    );

    const handleDetailsClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDetailsClick?.(item);
      },
      [item, onDetailsClick]
    );

    const showDetails = hasDetails && showDetailsHint;

    return (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        viewport={{ once: true, margin: "50px" }}
        style={{ willChange: "transform, opacity" }}
        onClick={handleOrderClick}
        className={`
          relative group flex flex-col bg-(--bg-card)
          rounded-2xl border border-(--menu-border)
          overflow-hidden shadow-sm
          transition-all duration-200
          ${unavailable
            ? "opacity-50 grayscale cursor-not-allowed"
            : "cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.98]"
          }
        `}
      >
        {/* ================= IMAGE ================= */}
        <div className="relative aspect-4/3 overflow-hidden bg-(--bg-main)">
          <img
            src={item.image ? `/images/${item.image}` : "/logo.png"}
            alt={itemName}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />

          {(item.star || (item as any).isFeatured) && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-primary text-white text-[10px] flex items-center gap-1 shadow">
              <FaFire size={10} />
              {t("common.featured") || "مميز"}
            </div>
          )}

          {unavailable && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold bg-primary px-3 py-1 rounded-full">
                {t("common.unavailable")}
              </span>
            </div>
          )}
        </div>

        {/* ================= CONTENT ================= */}
        <div className="p-3 flex flex-col flex-1">

          {/* Title + Price */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-[14px] font-bold line-clamp-1 text-right flex-1">
              {itemName}
            </h3>

            <div className="text-primary font-bold text-sm shrink-0">
              {basePrice} <span className="text-[10px] opacity-70">₪</span>
            </div>
          </div>

          {/* Description */}
          <p
            ref={descRef}
            className="text-[11px] text-(--text-muted) line-clamp-2 text-right leading-snug"
          >
            {description}
          </p>

          {/* ================= ACTION BAR ================= */}
          {canOrder && (
            <div
              className={`
                pt-2 mt-auto flex gap-2
                ${showDetails ? "items-center" : ""}
              `}
            >
              {/* DETAILS */}
              {showDetails && (
                <button
                  type="button"
                  onClick={handleDetailsClick}
                  className="
                    flex-1 flex items-center justify-center gap-1.5
                    py-1.5 rounded-xl text-[10px] sm:text-[11px]
                    font-bold border border-primary/20
                    bg-primary/5 text-primary
                    hover:bg-primary/10 active:scale-95
                    transition-all
                  "
                >
                  <FiInfo size={12} />
                  {t("common.details")}
                </button>
              )}

              {/* ORDER */}
              {showDetails ? (
                <button
                  type="button"
                  onClick={handleOrderClick}
                  className="
                    flex-1 flex items-center justify-center gap-1.5
                    py-1.5 rounded-xl text-[10px] sm:text-[11px]
                    font-bold bg-primary text-white
                    hover:bg-primary-hover active:scale-95
                    shadow-sm shadow-primary/20
                    transition-all
                  "
                >
                  <FiShoppingCart size={11} />
                  {t("common.order")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOrderClick}
                  className="
                    w-full flex items-center justify-center gap-2
                    py-2 rounded-xl text-[11px] font-bold
                    bg-primary text-white
                    hover:bg-primary-hover active:scale-95
                    shadow-sm shadow-primary/20
                    transition-all
                  "
                >
                  <FiShoppingCart size={12} />
                  {t("common.order")}
                </button>
              )}
            </div>
          )}
        </div>
      </motion.button>
    );
  }
);

export default ItemRow;
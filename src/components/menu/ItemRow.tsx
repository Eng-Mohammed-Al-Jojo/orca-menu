import React from "react";
import { type Item } from "./Menu";
import { FaFire } from "react-icons/fa";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Props {
  item: Item;
  orderSystem: boolean;
  index?: number;
  onClick?: (item: Item) => void;
  onDetailsClick?: (item: Item) => void;
}

const ItemRow = React.memo(({ item, orderSystem, index, onClick, onDetailsClick }: Props) => {
  const { t } = useTranslation();
  const prices = String(item.price).split(",");
  const basePrice = Number(prices[0]);
  const unavailable = item.visible === false;

  const itemName = item.nameAr || item.name || "";
  const hasDetails = !!(item.ingredients || item.ingredientsAr || item.ingredientsEn || (item as any).components?.length > 0);



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.05, duration: 0.5 }}
      viewport={{ once: true }}
      onClick={() => !unavailable && orderSystem && onClick?.(item)}
      className={`
        relative group flex flex-col h-full bg-(--bg-card) rounded-4xl border-2 border-primary/20
        overflow-hidden transition-all duration-300
        ${unavailable
          ? "opacity-50 grayscale cursor-not-allowed"
          : "cursor-pointer hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:ring-1 hover:ring-primary/30 hover:scale-[1.02] active:scale-[0.98]"
        }
      `}
    >
      {/* Thumbnail - Premium Height & Transition */}
      <div className="relative aspect-4/3 overflow-hidden bg-(--bg-main) shrink-0">
        <img
          src={item.image ? `/images/${item.image}` : "/logo.png"}
          alt={itemName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
        />

        {/* Floating Badges */}
        {(item.star || (item as any).isFeatured) && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 backdrop-blur-md text-white flex items-center gap-1.5 shadow-[0_4px_15px_rgba(245,158,11,0.4)] z-10 border border-white/20">
            <FaFire size={12} className="animate-pulse text-amber-200" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('common.featured') || "مميز"}</span>
          </div>
        )}

        {unavailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
            <span className="bg-primary/90 text-white text-[9px] font-black px-3 py-2 rounded-full uppercase tracking-widest leading-none shadow-xl">
              {t('common.unavailable')}
            </span>
          </div>
        )}
      </div>

      {/* Content Body - Optimized Hierarchy & Tighter Spacing */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 gap-1.5">
        <div className="flex justify-between items-start gap-1.5 px-0.5">
          <h3 className="text-[13px] sm:text-[15px] font-black text-(--text-main) leading-snug line-clamp-2 flex-1 tracking-tight">
            {itemName}
          </h3>
          <div className="text-sm sm:text-[17px] font-black text-primary shrink-0 flex items-baseline gap-0.5 shadow-primary/10">
            <span className="tracking-tighter">{basePrice}</span>
            <small className="text-[10px] opacity-80 font-black">₪</small>
          </div>
        </div>

        {/* Tighter Description Flow */}
        <div className="flex flex-col gap-2">


          {!unavailable && hasDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDetailsClick?.(item);
              }}
              className={`
                w-fit px-3 py-1.5 rounded-full bg-primary/5 text-primary 
                text-[9px] font-black uppercase tracking-[0.15em]
                hover:bg-primary/10 hover:shadow-sm transition-all active:scale-95
                flex items-center gap-1.5 group/btn border border-primary/10
              `}
            >
              <span>{t('common.details') || "View Details"}</span>
              <div className="w-1 h-1 rounded-full bg-primary/40 group-hover/btn:scale-125 transition-transform" />
            </button>
          )}
        </div>

        {/* Primary Action Hint (Very Subtle) */}
        {!unavailable && orderSystem && (
          <div className="mt-auto pt-2 flex items-center justify-center border-t border-(--border-color)/30">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/30 group-hover:text-primary/60 transition-colors">
              {t('menu.order') || "Order Now"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default ItemRow;

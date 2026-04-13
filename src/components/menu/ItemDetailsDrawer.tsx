import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheckCircle, FiInfo } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { Item } from "./Menu";
import { getIngredientList } from "../../utils/stringUtils";

interface Props {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ItemDetailsDrawer({ item, isOpen, onClose }: Props) {
  const { t } = useTranslation();

  if (!item) return null;

  const itemName = item.nameAr || item.name || "";
  const itemDescription = item.ingredientsAr || item.ingredients || "";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex justify-start overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ willChange: "opacity" }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"
          />

          {/* Drawer Body - Slides from Left for RTL luxury feel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md sm:max-w-lg bg-(--bg-card) h-full shadow-2xl border-r border-white/10 z-10 flex flex-col"
          >
            {/* Header / Banner Area */}
            <div className="relative h-64 sm:h-80 overflow-hidden shrink-0">
              <motion.img
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ willChange: "transform, opacity" }}
                src={item.image ? `/images/${item.image}` : "/logo.png"}
                alt={itemName}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-(--bg-card) via-transparent to-black/20" />

              <button
                onClick={onClose}
                className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-black/20 backdrop-blur-xl text-white flex items-center justify-center hover:bg-primary transition-all border border-white/20 shadow-xl group"
              >
                <FiX size={24} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <div className="absolute bottom-6 right-6 text-right">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-3xl font-bold text-white drop-shadow-2xl"
                >
                  {itemName}
                </motion.h2>
                <div className="flex items-center justify-end gap-2 mt-2 pl-4">
                  <span className="text-sm font-bold text-primary bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    {String(item.price).split(",")[0]} ₪
                  </span>
                </div>
              </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-10">

              {/* Ingredients Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FiInfo size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-(--text-main)">{t('admin.ingredients_label')}</h3>
                </div>

                <div className="relative">
                  <div className="absolute top-0 bottom-0 right-1 w-px bg-linear-to-b from-primary/30 via-primary/5 to-transparent" />
                  <div className="space-y-4 pr-6">
                    {getIngredientList(itemDescription).length > 0 ? (
                      getIngredientList(itemDescription).map((ingredient, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          style={{ willChange: "transform, opacity" }}
                          className="flex items-start gap-3 group"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                          <span className="text-sm sm:text-base font-bold text-(--text-main) leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            {ingredient}
                          </span>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-sm font-bold text-(--text-muted) italic">
                        {t('menu.no_description')}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Quality Badges */}
              <section className="pt-6 border-t border-(--border-color)/30 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col gap-2 group hover:bg-primary/10 transition-colors">
                  <FiCheckCircle className="text-primary" size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{t('menu.fresh_daily')}</span>
                  <p className="text-xs font-bold text-(--text-main)">{t('menu.fresh_daily_desc') || "يتم التحضير بمكونات طازجة يومياً"}</p>
                </div>
                <div className="p-4 rounded-3xl bg-secondary/5 border border-secondary/10 flex flex-col gap-2 group hover:bg-secondary/10 transition-colors">
                  <FiCheckCircle className="text-secondary" size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary/60">{t('menu.quality_guaranteed')}</span>
                  <p className="text-xs font-bold text-(--text-main)">{t('menu.quality_desc') || "نضمن لك أعلى مستويات الجودة"}</p>
                </div>
              </section>

            </div>

            {/* Action Sticky Footer (Social/Order context) */}
            <div className="p-6 sm:p-10 border-t border-(--border-color)/30 bg-(--bg-card)">
              <button
                onClick={onClose}
                className="w-full py-5 bg-primary text-white rounded-3xl font-bold text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {t('common.close')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

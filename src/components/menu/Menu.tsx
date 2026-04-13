import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import CategorySection from "./CategorySection";
import ItemRow from "./ItemRow";
import MenuSkeleton from "./MenuSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiSearch, FiX } from "react-icons/fi";
import { FaCommentDots } from "react-icons/fa";
import FeedbackModal from "./FeedbackModal";
import CategoryNavigation from "./CategoryNavigation";

import { MenuService } from "../../services/menuService";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, scale: 0.98 }
};

const categoryVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 }
};

/* ================= Types ================= */
export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  available?: boolean;
  order?: number;
  image?: string;
  visible?: boolean;
}

export interface Subcategory {
  id: string;
  nameAr: string;
  nameEn?: string;
  categoryId: string;
  image?: string;
  visible?: boolean;
  order?: number;
}

export interface Item {
  featured: any;
  image: string | undefined;
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  price: number;
  ingredients?: string;
  ingredientsAr?: string;
  ingredientsEn?: string;
  priceTw?: number;
  categoryId: string;
  subcategoryId?: string | null;
  visible?: boolean;
  star?: boolean;
  createdAt?: number;
  order?: number;
}

/* ================= Props ================= */
interface Props {
  onLoadingChange?: (loading: boolean) => void;
  onFeaturedCheck?: (hasFeatured: boolean) => void;
  onFeaturedItemsChange?: (items: Item[]) => void;
  orderSystem?: boolean;
  onItemClick?: (item: Item) => void;
  onDetailsClick?: (item: Item) => void;
}

type LoadingPhase = "loading" | "skeleton" | "ready";

const MIN_LOADING_TIME = 2000;
const SKELETON_DURATION = 600;

export default function Menu({ onLoadingChange, onFeaturedCheck, onFeaturedItemsChange, orderSystem: initialOrderSystem, onItemClick, onDetailsClick }: Props) {
  const { t } = useTranslation();


  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [phase, setPhase] = useState<LoadingPhase>("loading");
  const [orderSystem, setOrderSystem] = useState<boolean>(initialOrderSystem ?? true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>("all");

  const isMounted = useRef(true);
  const startTime = useRef(Date.now());

  /* ================= Data Fetching ================= */
  useEffect(() => {
    isMounted.current = true;
    onLoadingChange?.(true);

    let unsubscribe: (() => void) | null = null;

    const loadData = async () => {
      try {
        const { data } = await MenuService.getMenuWithFallback();
        if (!isMounted.current) return;

        setCategories(data.categories);
        setSubcategories(data.subcategories);
        setItems(data.items);
        setOrderSystem(data.orderSystem);

        const availableWithItems = data.categories.filter((cat: any) =>
          cat.available && data.items.some((i: any) => i.categoryId === cat.id && i.visible !== false)
        );

        if (availableWithItems.length > 0 && (!activeCategoryId || activeCategoryId === "all")) {
          // Default is "all", which we handle in the UI, but if we need a specific first category:
          // setActiveCategoryId("all"); // Or the first one if "all" is disabled
        }

        const wasLoaded = sessionStorage.getItem("menu_orca_initial_load");
        const elapsed = Date.now() - startTime.current;
        const remainingFetchTime = wasLoaded ? 0 : Math.max(0, MIN_LOADING_TIME - elapsed);

        setTimeout(() => {
          if (!isMounted.current) return;
          onLoadingChange?.(false);
          setPhase("skeleton");
          sessionStorage.setItem("menu_orca_initial_load", "true");

          setTimeout(() => {
            if (isMounted.current) setPhase("ready");
          }, SKELETON_DURATION);
        }, remainingFetchTime);

        unsubscribe = MenuService.subscribeToMenuUpdates((freshData) => {
          if (!isMounted.current) return;
          setCategories(freshData.categories);
          setSubcategories(freshData.subcategories);
          setItems(freshData.items);
          setOrderSystem(freshData.orderSystem);
        });
      } catch (err) {
        console.error("Menu load failed:", err);
        if (isMounted.current) {
          onLoadingChange?.(false);
          setPhase("ready");
        }
      }
    };

    loadData();
    return () => {
      isMounted.current = false;
      unsubscribe?.();
    };
  }, [onLoadingChange]);

  /* ================= Derived Data (Optimized) ================= */
  const featuredItems = useMemo(() =>
    items.filter(i => (i.star === true || (i as any).isFeatured === true) && i.visible !== false),
    [items]
  );

  const availableCategories = useMemo(() => {
    return categories
      .filter(cat => {
        if (!cat.available) return false;
        // Smart Filter: Ensure the category has at least one visible item
        return items.some(i => i.categoryId === cat.id && i.visible !== false);
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [categories, items]);

  const filteredItems = useMemo(() => {
    const search = searchTerm?.toLowerCase() ?? "";
    if (!search) return [];
    return items.filter((item) => {
      const name = (item.nameAr || item.name || "").toLowerCase();
      const ingredients = (item.ingredientsAr || item.ingredients || "").toLowerCase();
      return name.includes(search) || ingredients.includes(search);
    });
  }, [items, searchTerm]);

  useEffect(() => {
    onFeaturedCheck?.(featuredItems.length > 0);
    onFeaturedItemsChange?.(featuredItems);
  }, [featuredItems, onFeaturedCheck, onFeaturedItemsChange]);

  const handleItemClick = useCallback((item: Item) => {
    onItemClick?.(item);
  }, [onItemClick]);

  const activeCategory = useMemo(() =>
    availableCategories.find(c => c.id === activeCategoryId),
    [availableCategories, activeCategoryId]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchTerm("");
  }, []);

  /* ================= Phase: Loading ================= */
  if (phase === "loading") return null;

  /* ================= Phase: Skeleton ================= */
  if (phase === "skeleton") {
    return (
      <div className="menu-wrapper">
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-7xl mx-auto px-4 pb-32">
          <MenuSkeleton />
        </motion.div>
      </div>
    );
  }

  /* ================= Phase: Ready ================= */
  return (
    <div className="menu-wrapper bg-(--menu-bg)">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-1 pb-20"
      >
        <div className="flex flex-col gap-8">
          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            {/* Header / Search */}
            <div className="flex flex-col mb-8 gap-2">
              <div className="w-full max-w-2xl mx-auto relative group">
                <FiSearch className="right-6 absolute top-1/2 -translate-y-1/2 text-(--menu-text-muted) group-focus-within:text-primary transition-colors text-xl" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full bg-(--menu-search-bg) border border-primary rounded-3xl py-3 pr-14 pl-6 text-sm font-bold focus:border-secondary outline-none transition-all shadow-xl text-right text-(--menu-text)"
                />
                {searchTerm && (
                  <button onClick={handleSearchClear} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-(--menu-bg) flex items-center justify-center text-(--menu-text-muted) border border-(--border-color)"><FiX /></button>
                )}
              </div>
            </div>

            {/* Premium Category Navigation */}
            {!searchTerm && (
              <CategoryNavigation
                categories={availableCategories}
                activeId={activeCategoryId}
                onSelect={setActiveCategoryId}
              />
            )}

            <AnimatePresence mode="wait">
              {searchTerm ? (
                <motion.div
                  key="search"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                >
                  {filteredItems.map((item) => (
                    <ItemRow key={item.id} item={item} orderSystem={orderSystem} onClick={handleItemClick} onDetailsClick={onDetailsClick} />
                  ))}
                </motion.div>
              ) : availableCategories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-20 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center text-5xl grayscale opacity-50 shadow-inner">
                    🍽️
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-(--menu-text)">{t('menu.empty_menu') || "Menu Coming Soon"}</h3>
                    <p className="text-(--menu-text-muted) font-bold max-w-xs mx-auto">
                      {t('menu.empty_menu_desc') || "We are currently preparing our delicious selection. Please check back shortly."}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={activeCategoryId}
                  variants={categoryVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-12"
                >
                  {(activeCategoryId === "all" || !activeCategoryId) ? (
                    availableCategories.map((cat) => (
                      <CategorySection
                        key={cat.id}
                        category={cat}
                        subcategories={subcategories}
                        items={items.filter(i => i.categoryId === cat.id && i.visible !== false)}
                        orderSystem={orderSystem}
                        onItemClick={handleItemClick}
                        onDetailsClick={onDetailsClick}
                      />
                    ))
                  ) : (
                    activeCategory && (
                      <CategorySection
                        category={activeCategory}
                        subcategories={subcategories}
                        items={items.filter(i => i.categoryId === activeCategoryId && i.visible !== false)}
                        orderSystem={orderSystem}
                        onItemClick={handleItemClick}
                        onDetailsClick={onDetailsClick}
                      />
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        {/* Floating Components */}
        <button onClick={() => setShowFeedbackModal(true)} className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center z-40 group">
          <FaCommentDots size={24} />
        </button>
        <FeedbackModal show={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} orderSystem={orderSystem} />
      </motion.div>
    </div>
  );
}
import { useMemo } from "react";
import ItemRow from "./ItemRow";
import type { Category, Item, Subcategory } from "./Menu";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

interface Props {
  category: Category;
  subcategories: Subcategory[];
  items: Item[];
  orderSystem: boolean;
  onItemClick?: (item: Item) => void;
  onDetailsClick?: (item: Item) => void;
}

export default function CategorySection({ category, subcategories, items, orderSystem, onItemClick, onDetailsClick }: Props) {

  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    const noSubItems: Item[] = [];

    items.forEach(item => {
      const sub = subcategories.find(s => s.id === item.subcategoryId);
      if (item.subcategoryId && sub) {
        if (sub.visible === false) return;
        if (!groups[item.subcategoryId]) groups[item.subcategoryId] = [];
        groups[item.subcategoryId].push(item);
      } else {
        noSubItems.push(item);
      }
    });

    return { groups, noSubItems };
  }, [items, subcategories]);

  const activeSubcategories = useMemo(() => {
    return subcategories
      .filter(sub => sub.categoryId === category.id && sub.visible !== false && groupedItems.groups[sub.id])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [category.id, subcategories, groupedItems.groups]);

  if (category.visible === false) return null;

  const catName = category.nameAr || category.name || "";

  return (
    <div className="w-full space-y-10">
      {/* Category Header */}
      <div className="flex items-center gap-4">
        <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_20px_rgba(45,139,78,0.3)]" />
        <h2 className="text-2xl md:text-3xl font-bold text-(--menu-text) tracking-tight">
          {catName}
        </h2>
      </div>

      <div className="space-y-12">
        {/* Main Items */}
        {groupedItems.noSubItems.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {groupedItems.noSubItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                orderSystem={orderSystem}
                onClick={onItemClick}
                onDetailsClick={onDetailsClick}
              />
            ))}
          </motion.div>
        )}

        {/* Subcategories */}
        {activeSubcategories.map((sub) => (
          <div key={sub.id} className="space-y-6">
            <div className="flex items-center gap-3 w-full">

              {/* left line */}
              <div className="h-px flex-1 bg-primary/30" />

              {/* center title */}
              <span className="px-4 py-1.5 rounded-2xl bg-secondary/10 text-secondary text-sm md:text-base font-bold uppercase tracking-widest border border-secondary/20 whitespace-nowrap">
                {sub.nameAr}
              </span>

              {/* right line */}
              <div className="h-px flex-1 bg-primary/30" />

            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {groupedItems.groups[sub.id].map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  orderSystem={orderSystem}
                  onClick={onItemClick}
                  onDetailsClick={onDetailsClick}
                />
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import CartButton from "../components/cart/CartButton";
import Footer from "../components/menu/footer";
import Menu, { type Item } from "../components/menu/Menu";
import ItemModal from "../components/menu/ItemModal";
import ItemDetailsDrawer from "../components/menu/ItemDetailsDrawer";
import { HiSparkles } from "react-icons/hi";
import FeaturedModal from "../components/menu/FeaturedModal";
import LoadingScreen from "../components/common/LoadingScreen";
import { motion } from "framer-motion";
import { FirebaseService } from "../services/firebaseService";
import OrderStatusButton from "../components/cart/OrderStatusButton";
import GlassButton from "../components/common/GlassButton";

export default function MenuPage() {
  const { t } = useTranslation();

  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [hasFeatured, setHasFeatured] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<Item | null>(null);
  const [orderSystem, setOrderSystem] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseService.listen("settings/orderSystem", (value) => {
      setOrderSystem(value ?? true);
    });
    return () => unsubscribe();
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (!loading) setIsDataReady(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-(--menu-bg) text-(--menu-text) menu-wrapper overflow-x-hidden">

      {/* Loading */}
      <LoadingScreen visible={isLoading} />

      {/* ✅ Top Bar */}
      {/* ✅ Featured Button — Floating Left */}
      <div className="absolute top-4 left-4 z-50">
        {isDataReady && hasFeatured && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <GlassButton
              variant="featured"
              icon={<HiSparkles size={18} />}
              onClick={() => setShowFeaturedModal(true)}
              title={t("menu.featured_items")}
            />
          </motion.div>
        )}
      </div>

      <main className="flex flex-col flex-1">

        {/*Hero Section*/}
        <section className="relative flex flex-col items-center justify-center text-center py-10 px-6 overflow-hidden">

          {/* Soft ambient glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 0.8 }}
            style={{ willChange: "transform, opacity" }}
            className="absolute w-[400px] h-[400px] bg-primary rounded-full blur-2xl"
          />

          {/* Logo Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center"
          >

            {/* subtle ring */}
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 45 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              className="absolute w-[220px] h-[220px] md:w-[300px] md:h-[300px] rounded-full border border-primary/10"
            />

            {/* logo */}
            <motion.img
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ willChange: "transform, opacity" }}
              src="/logo.png"
              className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
              alt="Logo"
            />

          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 text-lg md:text-xl text-primary font-bold tracking-tight"
          >
            {t("menu.title")}
          </motion.h1>

        </section>
        {/* ✅ Menu */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pb-24">
          <Menu
            onLoadingChange={handleLoadingChange}
            onFeaturedCheck={setHasFeatured}
            onFeaturedItemsChange={setFeaturedItems}
            onItemClick={setSelectedItem}
            onDetailsClick={setSelectedDetailsItem}
          />
        </div>

      </main>

      {/* Cart */}
      {isDataReady && (
        <div className="fixed bottom-6 right-6 z-50">
          <CartButton />
        </div>
      )}

      {/* Modals */}
      <FeaturedModal
        isOpen={showFeaturedModal}
        onClose={() => setShowFeaturedModal(false)}
        orderSystem={orderSystem}
        items={featuredItems}
        onItemClick={setSelectedItem}
        onDetailsClick={setSelectedDetailsItem}
      />

      <ItemModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      <ItemDetailsDrawer
        isOpen={!!selectedDetailsItem}
        onClose={() => setSelectedDetailsItem(null)}
        item={selectedDetailsItem}
      />

      <OrderStatusButton />
      <Footer />
    </div>
  );
}
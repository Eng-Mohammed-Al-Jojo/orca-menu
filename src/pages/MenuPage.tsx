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

  /**
   * isLoading     → true while Firebase/cache fetch is in progress
   * isDataReady   → true once Menu signals that data has arrived
   * isSkeleton    → true during the skeleton-to-content transition (controlled inside Menu)
   *
   * LoadingScreen is visible as long as isLoading === true.
   * After isLoading becomes false → LoadingScreen fade-out starts.
   * CartButton / Featured button appear only after isDataReady === true.
   */
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [hasFeatured, setHasFeatured] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<Item | null>(null);
  const [orderSystem, setOrderSystem] = useState(true);

  // Listen for orderSystem toggle from Firebase settings
  useEffect(() => {
    const unsubscribe = FirebaseService.listen("settings/orderSystem", (value) => {
      setOrderSystem(value ?? true);
    });
    return () => unsubscribe();
  }, []);

  // Called by Menu when Firebase fetch completes → triggers LoadingScreen fade-out
  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (!loading) {
      setIsDataReady(true);
    }
  }, [setIsLoading, setIsDataReady]);

  return (
    <div className="min-h-screen flex flex-col bg-(--menu-bg) text-(--menu-text) font-['Cairo'] relative transition-colors duration-500 overflow-x-hidden">

      {/* ✅ Global Loading Screen — controlled by data fetch state */}
      <LoadingScreen visible={isLoading} />

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-80 bg-linear-to-b from-primary/15 to-transparent pointer-events-none"></div>

      {/* ✅ Top Bar — Featured Button Only */}
      <div className="absolute top-8 left-0 right-0 z-100 flex justify-end items-center px-6 sm:px-12 pointer-events-none">
        <div className="pointer-events-auto">
          {isDataReady && hasFeatured && (
            <GlassButton
              variant="featured"
              icon={<HiSparkles size={20} />}
              onClick={() => setShowFeaturedModal(true)}
              title={t("menu.featured_items")}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 flex flex-col min-h-screen pb-20">

        {/* Hero Banner Area */}
        <div className="relative w-full h-[60vh] md:h-[75vh] flex flex-col items-center justify-center text-center overflow-visible mb-12">

          {/* Main Banner Image with Multi-layered Masking */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-linear-to-b from-white/20 via-white/10 to-transparent z-10"
            />
            <motion.img
              initial={{ scale: 1.2, filter: 'blur(20px)', opacity: 0 }}
              animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              src="/logo.png"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }}
            />
            {/* Dynamic Light Overlay */}
            <motion.div
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-radial-gradient from-primary/20 via-transparent to-transparent z-5"
            />
          </div>

          {/* Hero Content - Premium Layout */}
          <div className="relative z-20 space-y-10 px-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-10"
            >
              {/* Premium Logo Container with Glowing Ring */}
              <div className="relative group">
                {/* Animated Ring */}
                <motion.div
                  animate={{ rotate: 360, opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-8 rounded-[4rem] border border-white/10 border-t-secondary/60 border-l-primary/60 blur-[1px]"
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-12 bg-primary/10 rounded-[5rem] blur-3xl -z-10"
                />

                <div className="w-40 h-40 md:w-56 md:h-56 p-6 bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
                  <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <img src="/logo.png" className="w-full h-full object-contain brightness-110 drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]" alt="Logo" />
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">

                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.8 }}
                  className="inline-flex items-center gap-4 px-4 py-1 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] group hover:bg-white/10 transition-colors"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_15px_#2D8B4E]" />
                  <p className="text-white text-base md:text-xl font-black tracking-[0.5em] uppercase opacity-90 drop-shadow-2xl">
                    {t("common.scroll_to_explore")}
                  </p>
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_15px_#2D8B4E]" />
                </motion.div>
              </div>
            </motion.div>
          </div>


        </div>

        {/* Menu Component */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8">
          <Menu
            onLoadingChange={handleLoadingChange}
            onFeaturedCheck={setHasFeatured}
            onFeaturedItemsChange={setFeaturedItems}
            onItemClick={setSelectedItem}
            onDetailsClick={setSelectedDetailsItem}
          />
        </div>

      </main>

      {/* Floating Cart — only after data is ready */}
      {isDataReady && <CartButton />}

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
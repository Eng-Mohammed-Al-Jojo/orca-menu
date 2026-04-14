import { useRef, useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShoppingCart, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import CartItem from "./CartItem";
import OrderTabs from "./OrderTabs";
import OrderTracking from "./OrderTracking";
import { db } from "../../firebase";
import { onValue, ref } from "firebase/database";
import { OrderService } from "../../services/orderService";
import { toast } from "react-hot-toast";

interface OrderSettings {
    inRestaurant: boolean;
    takeaway: boolean;
    inPhone: string;
    outPhone: string;
    orderMode?: "dashboard" | "whatsapp";
}

export default function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { items, totalPrice, clearCart, orderId, updateOrderId, isFullTrackingOpen, setIsFullTrackingOpen } = useCart();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const [step, setStep] = useState<"items" | "order">("items");
    const [orderSettings, setOrderSettings] = useState<OrderSettings | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sRef = ref(db, "settings");
        return onValue(sRef, (snap) => {
            const data = snap.val() || {};
            setOrderSettings(
                data.orderMode
                    ? { ...data.orderSettings, orderMode: data.orderMode }
                    : data.orderSettings || null
            );
        });
    }, []);

    useEffect(() => {
        if (!isOpen) {
            setStep("items");
        }
    }, [isOpen]);

    const handleConfirm = async (type: "in" | "out", customerData: any, message: string) => {
        if (submitting) return;

        setSubmitting(true);

        try {
            const isWaMode = orderSettings?.orderMode === "whatsapp";
            const orderIdStr = await OrderService.getNextOrderNumber();

            if (isWaMode) {
                await OrderService.createOrder({
                    orderId: orderIdStr,
                    customer: customerData,
                    items: items.map(i => ({
                        id: i.id,
                        nameAr: (i as any).nameAr || i.name,
                        qty: i.qty,
                        price: i.selectedPrice,
                        total: i.selectedPrice * i.qty
                    })),
                    totalPrice,
                    orderType: type,
                    paymentStatus: "unpaid",
                    status: "archived",
                    source: "whatsapp",
                    tracked: false,
                    excludedFromReports: true
                }, orderIdStr);

                const phone = type === "in" ? orderSettings?.inPhone : orderSettings?.outPhone;

                if (phone) {
                    const cleanPhone = phone.replace(/[\s\+]/g, '');
                    const encoded = encodeURIComponent(message);
                    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
                }

                toast.success(t('common.order_success_alert'));

                setTimeout(() => {
                    clearCart();
                    setStep("items");
                    onClose();
                }, 1200);

                return;
            }

            const cleanId = await OrderService.createOrder({
                orderId: orderIdStr,
                customer: customerData,
                items: items.map(i => ({
                    id: i.id,
                    nameAr: (i as any).nameAr || i.name,
                    qty: i.qty,
                    price: i.selectedPrice,
                    total: i.selectedPrice * i.qty
                })),
                totalPrice,
                orderType: type,
                paymentStatus: "unpaid",
                status: "pending",
                source: "dashboard",
                tracked: true,
                excludedFromReports: false
            }, orderIdStr);

            toast.success(t('common.order_saved_success'));
            updateOrderId(cleanId);
            setIsFullTrackingOpen(true);

            setTimeout(() => {
                clearCart();
                setStep("items");
            }, 1000);

        } catch (error) {
            console.error(error);
            toast.error(t('common.error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4 overflow-hidden">

                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ y: "100%", opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0.5 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="
                        relative w-full max-w-2xl lg:max-w-3xl
                        h-full sm:h-auto sm:max-h-[90vh]
                        bg-(--bg-card)
                        sm:rounded-4xl
                        shadow-2xl
                        overflow-hidden
                        flex flex-col
                        z-10
                        border border-white/5
                        lg:my-8
                    "
                >

                    {/* Header */}
                    <div className="p-6 sm:p-8 flex items-center justify-between border-b border-(--border-color) bg-(--bg-card) shrink-0 sticky top-0 z-20">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl shadow-xl shadow-primary/30">
                                {step === "items" ? <FiShoppingCart /> : <FiShoppingBag />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-(--text-main)">
                                    {step === "items" ? t('common.cart') : t('common.complete_order')}
                                </h2>
                                <p className="text-(--text-muted) text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mt-1 opacity-70">
                                    {items.length} {t('common.items')} • {totalPrice}₪
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-(--bg-main) text-(--text-muted) hover:text-red-500 hover:rotate-90 transition-all border border-(--border-color)"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Scroll Content */}
                    <div
                        ref={scrollRef}
                        className="
                            flex-1 overflow-y-auto custom-scrollbar

                            px-6 sm:px-8 lg:px-12
                            py-6 sm:py-8 lg:py-10

                            pb-32 sm:pb-36 lg:pb-40
                        "
                    >

                        <AnimatePresence mode="wait">
                            {step === "items" ? (
                                <motion.div
                                    key="items-step"
                                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
                                    className="space-y-4 sm:space-y-5 lg:space-y-6"
                                >
                                    {items.length === 0 ? (
                                        <div className="py-20 lg:py-28 text-center flex flex-col items-center gap-2">
                                            <div className="w-24 h-24 rounded-full bg-(--bg-main) flex items-center justify-center text-5xl mb-6 shadow-inner animate-pulse">
                                                🛒
                                            </div>
                                            <h3 className="text-xl font-black text-(--text-main)">
                                                {t('common.empty_cart')}
                                            </h3>
                                            <p className="text-(--text-muted) text-sm font-bold">
                                                {t('common.add_items_desc')}
                                            </p>

                                            <button
                                                onClick={onClose}
                                                className="mt-8 px-8 py-3 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                                            >
                                                {t('common.back_to_menu')}
                                            </button>
                                        </div>
                                    ) : (
                                        items.map((item) => (
                                            <CartItem key={item.priceKey} item={item} />
                                        ))
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="order-step"
                                    initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
                                >
                                    <div className="mb-6">
                                        <button
                                            onClick={() => setStep("items")}
                                            className="flex items-center gap-2 text-xs font-black text-primary hover:gap-3 transition-all"
                                        >
                                            <FiArrowRight className={isRtl ? "" : "rotate-180"} />
                                            {t('common.back_to_cart')}
                                        </button>
                                    </div>

                                    <OrderTabs
                                        onConfirm={handleConfirm}
                                        orderSettings={orderSettings || undefined}
                                        submitting={submitting}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>

                    {/* Footer */}
                    {step === "items" && items.length > 0 && (
                        <div className="p-6 sm:p-10 bg-linear-to-t from-(--bg-card) via-(--bg-card)/95 to-transparent pt-12 absolute bottom-0 inset-x-0 border-t border-white/5 pointer-events-none z-30">
                            <motion.button
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setStep("order")}
                                className="w-full py-5 rounded-full bg-primary text-white font-black shadow-[0_20px_50px_rgba(167,10,5,0.4)] flex items-center justify-between px-10 group pointer-events-auto hover:bg-primary/95 transition-all"
                            >
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] uppercase tracking-[0.2em] opacity-80">
                                        {t('common.total')}
                                    </span>
                                    <span className="text-2xl font-black">
                                        {totalPrice}₪
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-black uppercase tracking-widest">
                                        {t('common.order_now')}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                        <FiArrowRight size={22} className={isRtl ? "rotate-180" : ""} />
                                    </div>
                                </div>
                            </motion.button>
                        </div>
                    )}

                    {/* Tracking */}
                    <AnimatePresence>
                        {orderId && isFullTrackingOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute inset-0 z-50 bg-(--bg-card)"
                            >
                                <OrderTracking
                                    orderId={orderId}
                                    onClose={() => {
                                        setIsFullTrackingOpen(false);
                                        onClose();
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
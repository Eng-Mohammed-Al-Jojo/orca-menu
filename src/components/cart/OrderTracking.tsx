import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiCheckCircle, FiPackage, FiChevronRight, FiCheck } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { FirebaseService } from "../../services/firebaseService";
import PaymentMethodsDisplay from "../common/PaymentMethodsDisplay";

interface OrderTrackingProps {
    orderId: string;
    onClose: () => void;
}

export default function OrderTracking({ orderId, onClose }: OrderTrackingProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cleanId = (id: string) => id.replace(/#/g, '');
        const unsubscribe = FirebaseService.listen(`orders/${cleanId(orderId)}`, (val) => {
            setOrder(val);
            setLoading(false);
        });

        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, [orderId]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
            <p className="text-(--text-muted) font-bold">{t('common.loading_order')}</p>
        </div>
    );

    if (!order) return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center h-full">
            <div className="w-24 h-24 rounded-4xl bg-(--bg-main) flex items-center justify-center mb-6 text-5xl shadow-inner border border-(--border-color)">
                🔍
            </div>
            <h3 className="text-xl font-black text-(--text-main)">{t('common.order_not_found')}</h3>
            <p className="text-(--text-muted) text-sm mt-2 font-bold max-w-[250px]">
                {t('common.order_not_found_desc')}
            </p>
            <button
                onClick={onClose}
                className="mt-8 px-10 py-4 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
                {t('common.back_to_menu')}
            </button>
        </div>
    );

    const isUntracked = order.tracked === false;

    // Business Logic: If order is delivered or archived, we show the Success/Completed screen
    const isCompleted = order.status === "delivered" || order.archived === true;

    // Customer visible stages
    const statuses = ["pending", "confirmed", "preparing", "ready"];
    const currentStatus = order.status || "pending";
    const currentIndex = statuses.indexOf(currentStatus);

    const maskValue = (val: string) => {
        if (!val || val.length < 5) return val;
        return val.slice(0, 3) + "****" + val.slice(-2);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending": return <FiClock />;
            case "confirmed": return <FiCheckCircle />;
            case "preparing": return <FiPackage />;
            case "ready": return <FiBell size={24} />;
            default: return <FiClock />;
        }
    };

    const getStatusLabel = (status: string) => {
        return t(`admin.${status}`);
    };

    return (
        <div className="p-6 sm:p-8 space-y-8 min-h-[400px] h-full overflow-y-auto flex flex-col custom-scrollbar">
            <AnimatePresence mode="wait">
                {isCompleted ? (
                    <motion.div
                        key="completed"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="flex-1 flex flex-col items-center justify-center text-center py-6"
                    >
                        <div className="w-24 h-24 bg-green-500 text-white rounded-[2.5rem] flex items-center justify-center text-4xl mb-6 shadow-2xl shadow-green-500/20">
                            <FiCheck strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-black text-(--text-main)">{t('common.order_delivered') || "تم تسليم طلبك بنجاح!"}</h3>
                        <p className="text-(--text-muted) font-bold mt-2 max-w-[280px]">
                            {t('common.enjoy_meal') || "نتمنى لك وجبة شهية وتجربة رائعة معنا. ننتظرك مجدداً!"}
                        </p>
                        <div className="mt-8 px-6 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                            Order ID: {order.orderId}
                        </div>
                    </motion.div>
                ) : !isUntracked ? (
                    <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        {/* Header Tracking */}
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 mb-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                {t('common.live_tracking')}
                            </div>
                            <h3 className="text-2xl font-black text-(--text-main)">{t('common.order_status')}</h3>
                            <p className="text-(--text-muted) text-sm font-bold flex items-center justify-center gap-2">
                                {t('common.order_id')}: <span className="text-primary font-mono">{order.orderId}</span>
                            </p>
                        </div>

                        {/* Status Timeline */}
                        <div className="relative py-4">
                            {/* Connector Line */}
                            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-(--border-color) -translate-y-[150%] rounded-full z-0" />
                            <div
                                className="absolute top-1/2 left-4 right-4 h-0.5 bg-primary -translate-y-[150%] transition-all duration-1000 rounded-full z-0"
                                style={{
                                    width: currentIndex < 0 ? '0%' : `${(currentIndex / (statuses.length - 1)) * 92}%`,
                                    [isRtl ? 'right' : 'left']: '1rem'
                                }}
                            />

                            <div className="flex justify-between relative z-10 gap-2">
                                {statuses.map((status, idx) => {
                                    const isCompletedStatus = idx <= currentIndex;
                                    const isCurrent = idx === currentIndex;

                                    return (
                                        <div key={status} className="flex flex-col items-center gap-3 min-w-0">
                                            <motion.div
                                                animate={isCurrent ? { scale: [1, 1.15, 1], y: [0, -4, 0] } : {}}
                                                transition={{ repeat: Infinity, duration: 3 }}
                                                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all duration-500 shadow-xl border-2 ${isCurrent ? "bg-primary text-white border-primary shadow-primary/30 ring-4 ring-primary/10" :
                                                    isCompletedStatus ? "bg-primary/20 text-primary border-primary/30" : "bg-(--bg-card) text-(--text-muted) border-(--border-color)"
                                                    }`}
                                            >
                                                {getStatusIcon(status)}
                                            </motion.div>
                                            <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-tighter whitespace-nowrap px-1 ${isCompletedStatus ? "text-primary" : "text-(--text-muted)"
                                                }`}>
                                                {getStatusLabel(status)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Brief */}
                        <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-6 space-y-4 shadow-inner">
                            <div className="flex justify-between items-center text-xs font-black text-primary/60 uppercase tracking-widest">
                                <span>{t('admin.ordered_items')}</span>
                                <span>{order.items?.length} {t('admin.products')}</span>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {order.items?.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                        <div className="flex gap-2 items-center">
                                            <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center font-black text-primary text-[10px] shadow-sm">{item.qty}</span>
                                            <span className="font-bold text-(--text-main)">{i18n.language === 'ar' ? item.nameAr : item.nameEn || item.nameAr}</span>
                                        </div>
                                        <span className="font-mono text-(--text-muted) font-bold">{item.total}₪</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                                <span className="text-sm font-black text-(--text-main)">{t('common.total')}</span>
                                <span className="text-2xl font-black text-primary">{order.totalPrice}₪</span>
                            </div>
                        </div>

                        {/* ✅ Payment Methods - أضف هون */}
                        <div>
                            <h3 className="text-xs font-black text-(--text-muted) uppercase tracking-widest px-1 mb-3">
                                {t('admin.available_payment_methods')}
                            </h3>
                            <PaymentMethodsDisplay />
                        </div>
                    </motion.div>
                ) : null}

                {isUntracked && !isCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 flex flex-col items-center justify-center text-center py-10"
                    >
                        <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center text-3xl mb-6 border border-amber-500/20">
                            <FaWhatsapp />
                        </div>
                        <h3 className="text-xl font-black text-(--text-main)">{t('admin.order_sent_wa')}</h3>
                        <p className="text-(--text-muted) text-sm font-bold mt-2 max-w-[280px]">
                            {t('admin.tracking_disabled')}
                        </p>
                        <div className="mt-8 p-6 bg-(--bg-main) rounded-3xl border border-(--border-color) w-full text-right space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">{t('common.order_id')}</span>
                                <span className="text-sm font-black text-primary">{order.orderId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">{t('admin.customer')}</span>
                                <span className="text-sm font-bold text-(--text-main)">{order.customer?.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest">{t('admin.phone')}</span>
                                <span className="text-sm font-bold text-(--text-main) dir-ltr">{maskValue(order.customer?.phone || "")}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-(--bg-card) text-(--text-main) border border-(--border-color) font-black text-sm hover:bg-(--bg-main) transition-all flex items-center justify-center gap-2 group mt-auto"
            >
                {t('common.back_to_menu')}
                <FiChevronRight className={`transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </button>
        </div>
    );
}

// Internal icons helper
function FiBell({ size }: { size: number }) {
    return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={size} width={size} xmlns="http://www.w3.org/2000/svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
}

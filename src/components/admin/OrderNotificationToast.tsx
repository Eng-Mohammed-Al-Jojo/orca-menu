import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingBag, FiInfo, FiX } from "react-icons/fi";
import type { Order } from "../../types/order";

interface Props {
    notifications: Order[];
    onClose: (id: string) => void;
    onView: (order: Order) => void;
}

/**
 * OrderNotificationToast
 * Premium stacked notification system for new orders
 */
export default function OrderNotificationToast({ notifications, onClose, onView }: Props) {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-4 w-full max-w-sm pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((order) => (
                    <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
                        className="w-full bg-(--bg-card) border border-(--border-color) shadow-2xl rounded-3xl overflow-hidden pointer-events-auto flex flex-col group backdrop-blur-xl bg-opacity-95"
                    >
                        <div className="p-5 flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                                <FiShoppingBag size={28} className="animate-bounce" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-sm font-black text-(--text-main) font-['Cairo'] tracking-tight">طلب جديد! 🔔</h3>
                                    <button 
                                        onClick={() => onClose(order.id)}
                                        className="text-(--text-muted) hover:text-(--text-main) p-1 -m-1 transition-colors"
                                    >
                                        <FiX size={18} />
                                    </button>
                                </div>
                                
                                <p className="text-2xl font-black text-primary font-mono tracking-tighter mt-1">
                                    {order.orderId}
                                </p>
                                
                                <div className="flex items-center gap-2 mt-2">
                                     <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${order.orderType === 'in' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'}`}>
                                        {order.orderType === 'in' ? 'داخل المطعم 🍽️' : 'تيك أواي 🥡'}
                                    </span>
                                    <span className="text-[11px] font-bold text-(--text-muted) truncate max-w-[120px]">
                                        {order.customer?.name}
                                    </span>

                                    <div className="ms-auto">
                                        <span className="text-sm font-black text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                                            {order.totalPrice}₪
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-5 pb-5">
                            <button 
                                onClick={() => {
                                    onView(order);
                                    onClose(order.id);
                                }}
                                className="w-full py-3.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 group-hover:shadow-xl group-hover:shadow-primary/20"
                            >
                                <FiInfo size={16} />
                                عرض تفاصيل الطلب
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

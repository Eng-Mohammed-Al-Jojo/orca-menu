import { useState, useEffect, useRef, useCallback } from "react";
import type { Order } from "../types/order";
import { OrderService } from "../services/orderService";
import { playNewOrderSound } from "../utils/audioUtils";

/**
 * useOrderNotifications
 * Senior-level hook for real-time order detection and notification queuing.
 * Handles isFirstLoad logic, sound debouncing, and audio activation.
 */
export const useOrderNotifications = (limit: number = 20) => {
    const [notifications, setNotifications] = useState<Order[]>([]);
    const knownOrderIds = useRef<Set<string>>(new Set());
    const isFirstLoad = useRef(true);
    const audioEnabled = useRef(false);
    const soundDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Activates audio engine on first user interaction.
     * Essential for bypassing browser autoplay restrictions.
     */
    const enableAudio = useCallback(() => {
        if (audioEnabled.current) return;
        audioEnabled.current = true;
        
        // Warm up audio system with a brief silent play if needed,
        // but since we have a dedicated utility, we just mark as ready.
        console.log("Order Notification System: Audio Ready 🔊");
        
        window.removeEventListener('click', enableAudio);
        window.removeEventListener('touchstart', enableAudio);
    }, []);

    useEffect(() => {
        window.addEventListener('click', enableAudio);
        window.addEventListener('touchstart', enableAudio);
        return () => {
            window.removeEventListener('click', enableAudio);
            window.removeEventListener('touchstart', enableAudio);
        };
    }, [enableAudio]);

    /**
     * Plays the notification sound with a slight debounce
     * to prevent audio "clashing" if multiple orders arrive instantly.
     */
    const triggerSound = useCallback(() => {
        if (!audioEnabled.current) return;
        
        if (soundDebounceTimer.current) clearTimeout(soundDebounceTimer.current);
        
        soundDebounceTimer.current = setTimeout(() => {
            playNewOrderSound();
            soundDebounceTimer.current = null;
        }, 150);
    }, []);

    useEffect(() => {
        // We only track the latest orders to prevent memory bloat
        const unsubscribe = OrderService.listenToOrders(limit, (orders) => {
            if (isFirstLoad.current) {
                // Phase 1: Silent hydration of current orders
                orders.forEach(o => knownOrderIds.current.add(o.id));
                isFirstLoad.current = false;
                console.log(`Order Monitoring: Active (Hydrated ${orders.length} existing orders)`);
                return;
            }

            // Phase 2: Detect truly new orders by ID reconciliation
            const incomingNewOrders: Order[] = [];
            
            orders.forEach(order => {
                if (!knownOrderIds.current.has(order.id)) {
                    knownOrderIds.current.add(order.id);
                    incomingNewOrders.push(order);
                }
            });

            if (incomingNewOrders.length > 0) {
                setNotifications(prev => [...prev, ...incomingNewOrders]);
                triggerSound();
            }
        });

        return () => unsubscribe();
    }, [limit, triggerSound]);

    /**
     * Remove a notification from the UI stack
     */
    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(o => o.id !== id));
    }, []);

    /**
     * Auto-dismissal logic: oldest notifications disappear after 5 seconds
     */
    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                dismissNotification(notifications[0].id);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notifications, dismissNotification]);

    return {
        notifications,
        dismissNotification
    };
};

import { FirebaseService } from "./firebaseService";
import type { PaymentMethod } from "../types/payment";

const PATH = "settings/paymentMethods";

export const PaymentService = {
    /**
     * Listen to payment methods in real-time
     */
    listenToPaymentMethods: (callback: (methods: PaymentMethod[]) => void) => {
        return FirebaseService.listen(PATH, (data) => {
            if (!data) {
                callback([]);
                return;
            }
            
            const methodsArray: PaymentMethod[] = Object.entries(data).map(([id, val]: [string, any]) => ({
                id,
                ...val,
                fields: val.fields || []
            }));
            
            // Sort by order field
            methodsArray.sort((a, b) => (a.order || 0) - (b.order || 0));
            callback(methodsArray);
        });
    },

    /**
     * Save/Update a payment method
     */
    savePaymentMethod: async (method: Partial<PaymentMethod>) => {
        const id = method.id || `method_${Date.now()}`;
        const data = {
            ...method,
            id,
            fields: method.fields || []
        };
        
        return FirebaseService.update(`${PATH}/${id}`, data);
    },

    /**
     * Delete a payment method
     */
    deletePaymentMethod: async (id: string) => {
        return FirebaseService.remove(`${PATH}/${id}`);
    },

    /**
     * Batch update for reordering
     */
    reorderMethods: async (methods: PaymentMethod[]) => {
        const updates: any = {};
        methods.forEach((m, index) => {
            updates[`${m.id}/order`] = index + 1;
        });
        return FirebaseService.update(PATH, updates);
    }
};

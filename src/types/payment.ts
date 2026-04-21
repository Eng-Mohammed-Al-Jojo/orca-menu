export interface PaymentMethodField {
    id: string;
    label: string;
    value: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    image: string;
    isActive: boolean;
    order: number;
    fields: PaymentMethodField[];
}

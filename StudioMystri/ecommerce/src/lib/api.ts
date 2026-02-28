/// <reference types="vite/client" />

/**
 * Studio Mystri eCommerce — BMS API Client
 *
 * Centralized API client that points to the BMS backend.
 * All eCommerce API calls go through here.
 */

const BMS_API_URL = (import.meta.env.VITE_BMS_API_URL as string) || 'http://localhost:5000/api/v1';

// ─── Token Management ────────────────────────────────────
export function getToken(): string | null {
    return localStorage.getItem('sm_auth_token');
}

export function setToken(token: string): void {
    localStorage.setItem('sm_auth_token', token);
}

export function clearToken(): void {
    localStorage.removeItem('sm_auth_token');
}

// ─── Request Helpers ─────────────────────────────────────
interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
}

async function request<T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BMS_API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
}

export function apiGet<T = any>(endpoint: string) {
    return request<T>(endpoint, { method: 'GET' });
}

export function apiPost<T = any>(endpoint: string, body: any) {
    return request<T>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
    });
}

export function apiPatch<T = any>(endpoint: string, body: any) {
    return request<T>(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(body),
    });
}

export function apiDelete<T = any>(endpoint: string) {
    return request<T>(endpoint, { method: 'DELETE' });
}

// ─── eCommerce API Functions ─────────────────────────────

/** Fetch all visible products */
export function getProducts() {
    return apiGet('/ecommerce/products');
}

/** Fetch a single product by slug */
export function getProductBySlug(slug: string) {
    return apiGet(`/ecommerce/products/${slug}`);
}

/** Create a new order (returns razorpayOrderId) */
export function createOrder(orderData: any) {
    return apiPost('/ecommerce/orders', orderData);
}

/** Fetch an order by order number */
export function getOrder(orderNumber: string) {
    return apiGet(`/ecommerce/orders/${orderNumber}`);
}

/** Verify Razorpay payment */
export function verifyPayment(orderNumber: string, paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}) {
    return apiPost(`/ecommerce/orders/${orderNumber}/verify-payment`, paymentData);
}

/** Validate a discount code */
export function validateDiscount(code: string, orderAmount: number, userId?: string) {
    return apiPost('/ecommerce/discounts/validate', { code, orderAmount, userId });
}

/** Register a new customer account */
export function registerCustomer(data: { name: string; email: string; password: string; phone?: string }) {
    return apiPost('/ecommerce/auth/register', data);
}

/** Login a customer */
export function loginCustomer(email: string, password: string) {
    return apiPost('/ecommerce/auth/login', { email, password });
}

/** Generate a referral code */
export function generateReferralCode(userId: string) {
    return apiPost('/ecommerce/referral/generate', { userId });
}

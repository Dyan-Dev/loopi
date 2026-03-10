import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";
import axios, { type AxiosRequestConfig } from "axios";

const STRIPE_BASE_URL = "https://api.stripe.com/v1";

/**
 * Stripe API handler
 * API: https://api.stripe.com/v1
 * NOTE: Stripe uses form-encoded bodies, not JSON
 */
export class StripeHandler {
  private async resolveCredentials(step: {
    credentialId?: string;
    secretKey?: string;
  }): Promise<{ secretKey: string }> {
    if (step.credentialId) {
      const cred = getCredential(step.credentialId);
      if (cred?.data?.secretKey) return { secretKey: cred.data.secretKey };
      if (cred?.data?.apiKey) return { secretKey: cred.data.apiKey };
    }
    if (step.secretKey) return { secretKey: step.secretKey };
    throw new Error("Stripe secret key is required.");
  }

  private async callApi(
    secretKey: string,
    method: string,
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<unknown> {
    const url = `${STRIPE_BASE_URL}${endpoint}`;
    debugLogger.debug("Stripe", `${method} ${endpoint}`);

    // Stripe requires form-encoded data
    const formData = data ? this.toFormEncoded(data) : undefined;

    const config: AxiosRequestConfig = {
      method: method as AxiosRequestConfig["method"],
      url,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: formData,
    };
    const response = await axios(config);
    return response.data;
  }

  private toFormEncoded(obj: Record<string, unknown>, prefix = ""): string {
    const pairs: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue;
      const fullKey = prefix ? `${prefix}[${key}]` : key;
      if (typeof value === "object" && !Array.isArray(value)) {
        pairs.push(this.toFormEncoded(value as Record<string, unknown>, fullKey));
      } else {
        pairs.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(String(value))}`);
      }
    }
    return pairs.filter(Boolean).join("&");
  }

  async executeGetBalance(
    step: { credentialId?: string; secretKey?: string; storeKey?: string },
    _substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { secretKey } = await this.resolveCredentials(step);
    const result = await this.callApi(secretKey, "GET", "/balance");
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeCreateCustomer(
    step: {
      name?: string;
      email?: string;
      description?: string;
      phone?: string;
      metadata?: string;
      credentialId?: string;
      secretKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { secretKey } = await this.resolveCredentials(step);
    const data: Record<string, unknown> = {};
    if (step.name) data.name = substituteVariables(step.name);
    if (step.email) data.email = substituteVariables(step.email);
    if (step.description) data.description = substituteVariables(step.description);
    if (step.phone) data.phone = substituteVariables(step.phone);
    if (step.metadata) {
      try {
        data.metadata = JSON.parse(substituteVariables(step.metadata));
      } catch {
        /* ignore */
      }
    }
    const result = await this.callApi(secretKey, "POST", "/customers", data);
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Stripe", "Customer created");
    return result;
  }

  async executeGetCustomer(
    step: {
      customerId: string;
      credentialId?: string;
      secretKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { secretKey } = await this.resolveCredentials(step);
    const id = substituteVariables(step.customerId);
    const result = await this.callApi(secretKey, "GET", `/customers/${id}`);
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeListCustomers(
    step: {
      limit?: string;
      email?: string;
      credentialId?: string;
      secretKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { secretKey } = await this.resolveCredentials(step);
    const params = new URLSearchParams();
    if (step.limit) params.set("limit", step.limit);
    if (step.email) params.set("email", substituteVariables(step.email));
    const qs = params.toString();
    const result = await this.callApi(secretKey, "GET", `/customers${qs ? `?${qs}` : ""}`);
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeCreateCharge(
    step: {
      amount: string;
      currency: string;
      customerId?: string;
      source?: string;
      description?: string;
      credentialId?: string;
      secretKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { secretKey } = await this.resolveCredentials(step);
    const data: Record<string, unknown> = {
      amount: Number(substituteVariables(step.amount)),
      currency: substituteVariables(step.currency).toLowerCase(),
    };
    if (step.customerId) data.customer = substituteVariables(step.customerId);
    if (step.source) data.source = substituteVariables(step.source);
    if (step.description) data.description = substituteVariables(step.description);
    const result = await this.callApi(secretKey, "POST", "/charges", data);
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Stripe", "Charge created");
    return result;
  }

  async executeCreatePaymentIntent(
    step: {
      amount: string;
      currency: string;
      customerId?: string;
      paymentMethodTypes?: string;
      description?: string;
      credentialId?: string;
      secretKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { secretKey } = await this.resolveCredentials(step);
    const data: Record<string, unknown> = {
      amount: Number(substituteVariables(step.amount)),
      currency: substituteVariables(step.currency).toLowerCase(),
    };
    if (step.customerId) data.customer = substituteVariables(step.customerId);
    if (step.description) data.description = substituteVariables(step.description);
    if (step.paymentMethodTypes) {
      const types = substituteVariables(step.paymentMethodTypes)
        .split(",")
        .map((t) => t.trim());
      // Stripe form encoding for arrays: payment_method_types[0]=card
      types.forEach((t, i) => {
        data[`payment_method_types[${i}]`] = t;
      });
    }
    const result = await this.callApi(secretKey, "POST", "/payment_intents", data);
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Stripe", "PaymentIntent created");
    return result;
  }

  async executeListCharges(
    step: {
      limit?: string;
      customerId?: string;
      credentialId?: string;
      secretKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { secretKey } = await this.resolveCredentials(step);
    const params = new URLSearchParams();
    if (step.limit) params.set("limit", step.limit);
    if (step.customerId) params.set("customer", substituteVariables(step.customerId));
    const qs = params.toString();
    const result = await this.callApi(secretKey, "GET", `/charges${qs ? `?${qs}` : ""}`);
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  priceId: string;
  userType: "worker" | "employer";
  userId: string;
  email: string;
  plan?: "basic" | "premium";
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-09-30.clover",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Parse request body
    const body: CheckoutRequest = await req.json();
    const { priceId, userType, userId, email, plan } = body;

    // Validate input
    if (!priceId || !userType || !userId || !email) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: priceId, userType, userId, email",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the origin for success/cancel URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "ideal", "bancontact"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${
        userType === "worker" ? "dashboard" : "employer/dashboard"
      }`,
      customer_email: email,
      metadata: {
        userId,
        userType,
        plan: plan || "premium",
      },
      subscription_data: {
        metadata: {
          userId,
          userType,
          plan: plan || "premium",
        },
      },
    });

    console.log(
      `✅ Checkout session created for ${userType} ${userId}: ${session.id}`
    );

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

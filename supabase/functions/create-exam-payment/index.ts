import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExamPaymentRequest {
  userId: string;
  email: string;
  priceId: string; // ZZP Exam Price ID (€230)
  examData: {
    examDate: string;
    warehouseLocation: string;
    experienceDescription: string;
    specializations: string[];
    contactPhone?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body: ExamPaymentRequest = await req.json();
    const { userId, email, priceId, examData } = body;

    // Validate input
    if (!userId || !email || !priceId || !examData) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: userId, email, priceId, examData' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate exam data
    if (!examData.examDate || !examData.warehouseLocation || !examData.experienceDescription || !examData.specializations || examData.specializations.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Incomplete exam data provided' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create application record in database (status: pending_payment)
    const { data: application, error: dbError } = await supabase
      .from('zzp_exam_applications')
      .insert({
        worker_id: userId,
        exam_date: examData.examDate,
        warehouse_location: examData.warehouseLocation,
        experience_description: examData.experienceDescription,
        specializations: examData.specializations,
        contact_phone: examData.contactPhone || null,
        payment_status: 'pending',
        payment_amount: 230.00,
        payment_currency: 'EUR',
        status: 'pending_payment'
      })
      .select()
      .single();

    if (dbError || !application) {
      console.error('Database error:', dbError);
      throw new Error('Failed to create exam application');
    }

    console.log('✅ Exam application created:', application.id);

    // Get the origin for success/cancel URLs
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe checkout session (ONE-TIME payment!)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal', 'bancontact'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // ONE-TIME payment (not subscription!)
      success_url: `${origin}/exam-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/worker`,
      customer_email: email,
      metadata: {
        userId,
        applicationId: application.id,
        examDate: examData.examDate,
        warehouseLocation: examData.warehouseLocation,
        type: 'zzp_exam'
      },
      payment_intent_data: {
        metadata: {
          userId,
          applicationId: application.id,
          type: 'zzp_exam'
        }
      }
    });

    console.log(`✅ Checkout session created for exam application ${application.id}: ${session.id}`);

    // Update application with Stripe session ID
    await supabase
      .from('zzp_exam_applications')
      .update({ 
        stripe_session_id: session.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', application.id);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url,
        applicationId: application.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error creating exam payment session:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

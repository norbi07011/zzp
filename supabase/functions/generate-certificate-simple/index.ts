// @ts-nocheck - Deno Edge Function (VSCode doesn't understand Deno runtime types)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json();
    const {
      worker_id,
      verification_reason,
      issued_by_admin_id,
      issued_by_admin_name,
    } = body;

    console.log("🚀 Certificate generation request:", { worker_id });

    // Try workers table first
    let worker: any = null;
    const { data: workerData } = await supabase
      .from("workers")
      .select(
        "id, btw_number, kvk_number, specialization, profile:profiles!workers_profile_id_fkey(full_name)"
      )
      .eq("id", worker_id)
      .single();

    if (workerData) {
      worker = {
        id: workerData.id,
        full_name: workerData.profile?.full_name || "Unknown Worker",
        btw_sofi_number: workerData.btw_number,
        kvk_number: workerData.kvk_number,
        specialization: workerData.specialization,
      };
      console.log("✅ Found in workers table:", worker.full_name);
    } else {
      // Try cleaning_companies table
      const { data: cleaningData } = await supabase
        .from("cleaning_companies")
        .select(
          "id, kvk_number, company_name, specialization, profile:profiles!cleaning_companies_profile_id_fkey(full_name)"
        )
        .eq("id", worker_id)
        .single();

      if (cleaningData) {
        worker = {
          id: cleaningData.id,
          full_name:
            cleaningData.profile?.full_name || cleaningData.company_name,
          btw_sofi_number: null,
          kvk_number: cleaningData.kvk_number,
          specialization: Array.isArray(cleaningData.specialization)
            ? cleaningData.specialization.join(", ")
            : cleaningData.specialization,
        };
        console.log("✅ Found in cleaning_companies table:", worker.full_name);
      } else {
        return new Response(JSON.stringify({ error: "Worker not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate certificate ID
    const issueDate = new Date();
    const year = issueDate.getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const certificateId = `ZZP-${year}-${randomNum}`;

    console.log("📝 Generated certificate_id:", certificateId);

    // Create database record
    const validUntil = new Date(issueDate);
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const { data: certificate, error: certificateError } = await supabase
      .from("generated_certificates")
      .insert({
        certificate_id: certificateId,
        worker_id: worker.id,
        worker_full_name: worker.full_name,
        worker_btw_sofi: worker.btw_sofi_number,
        worker_kvk: worker.kvk_number,
        worker_specialization: worker.specialization,
        verification_reason,
        issue_date: issueDate.toISOString(),
        valid_until: validUntil.toISOString(),
        issued_by_admin_id,
        issued_by_admin_name,
        status: "active",
        pdf_url: `https://placeholder-pdf-url.com/${certificateId}.pdf`,
        pdf_storage_path: `certificates/${certificateId}.pdf`,
      })
      .select("id, certificate_id")
      .single();

    if (certificateError) {
      console.error("❌ Database error:", certificateError);
      return new Response(
        JSON.stringify({ error: "Database error", details: certificateError }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Certificate created successfully:", certificateId);

    // Return success (without PDF generation for now)
    return new Response(
      JSON.stringify({
        success: true,
        certificate: {
          id: certificate.id,
          certificate_id: certificateId,
          pdf_url: `https://placeholder-pdf-url.com/${certificateId}.pdf`,
          worker_name: worker.full_name,
          issue_date: issueDate.toISOString(),
          valid_until: validUntil.toISOString(),
          note: "PDF generation temporarily disabled for testing",
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("❌ Unhandled error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

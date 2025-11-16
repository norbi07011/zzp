// @ts-nocheck - Deno Edge Function (VS Code shows false errors for Deno imports)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Puppeteer for Deno - lightweight browser automation
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GenerateCertificateRequest {
  worker_id: string;
  verification_reason: string;
  issued_by_admin_id: string;
  issued_by_admin_name: string;
  certificate_html: string; // Full rendered HTML from React component
}

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
    const body: GenerateCertificateRequest = await req.json();
    const {
      worker_id,
      verification_reason,
      issued_by_admin_id,
      issued_by_admin_name,
      certificate_html,
    } = body;

    // Validate required fields
    if (
      !worker_id ||
      !verification_reason ||
      !issued_by_admin_id ||
      !certificate_html
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          required: [
            "worker_id",
            "verification_reason",
            "issued_by_admin_id",
            "certificate_html",
          ],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🚀 Generating certificate for worker:", worker_id);

    // Try to fetch from workers table first
    let worker: any = null;
    let workerType = "worker";

    const { data: workerData, error: workerError } = await supabase
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
      workerType = "worker";
      console.log(
        "✅ Worker data retrieved (workers table):",
        worker.full_name
      );
    } else {
      // Try cleaning_companies table (NOTE: cleaning_companies doesn't have btw_number!)
      const { data: cleaningData, error: cleaningError } = await supabase
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
          btw_sofi_number: null, // cleaning_companies doesn't have btw_number
          kvk_number: cleaningData.kvk_number,
          specialization: Array.isArray(cleaningData.specialization)
            ? cleaningData.specialization.join(", ")
            : cleaningData.specialization,
        };
        workerType = "cleaning_company";
        console.log(
          "✅ Worker data retrieved (cleaning_companies table):",
          worker.full_name
        );
      } else {
        console.error("❌ Worker not found in any table:", {
          workerError,
          cleaningError,
        });
        return new Response(
          JSON.stringify({
            error: "Worker not found",
            details: "Not found in workers or cleaning_companies tables",
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Calculate validity period (1 year from issue date)
    const issueDate = new Date();
    const validUntil = new Date(issueDate);
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    // Generate certificate ID (format: ZZP-YYYY-XXXXX)
    const year = issueDate.getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
    const certificateId = `ZZP-${year}-${randomNum}`;

    console.log("📝 Generated certificate_id:", certificateId);

    console.log("🌐 Launching Puppeteer browser...");
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    // Set viewport to A4 Landscape (300 DPI for print quality)
    await page.setViewport({
      width: 3508, // 297mm * 300 DPI / 25.4
      height: 2480, // 210mm * 300 DPI / 25.4
      deviceScaleFactor: 2, // Retina quality
    });

    // Load Google Fonts CSS
    const googleFontsCSS = `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    `;

    // Inject HTML with fonts
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          ${googleFontsCSS}
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${certificate_html}
        </body>
      </html>
    `;

    await page.setContent(fullHTML, { waitUntil: "networkidle0" });

    console.log("📄 Rendering PDF...");

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true, // Essential for backgrounds/gradients
      preferCSSPageSize: false,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      scale: 1,
    });

    await browser.close();
    console.log("✅ PDF generated successfully");

    // Upload PDF to Supabase Storage
    const pdfFileName = `${certificateId}.pdf`;
    const pdfPath = `certificates/${pdfFileName}`;

    console.log("☁️ Uploading PDF to storage:", pdfPath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(pdfPath, pdfBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Failed to upload PDF:", uploadError);
      return new Response(
        JSON.stringify({
          error: "Failed to upload PDF",
          details: uploadError,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ PDF uploaded successfully");

    // Get public URL for PDF
    const { data: publicUrlData } = supabase.storage
      .from("certificates")
      .getPublicUrl(pdfPath);

    const pdfUrl = publicUrlData.publicUrl;

    // Create database record with all data
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
        pdf_url: pdfUrl,
        pdf_storage_path: pdfPath,
      })
      .select("id, certificate_id")
      .single();

    if (certificateError || !certificate) {
      console.error(
        "❌ Failed to create certificate record:",
        certificateError
      );

      // Rollback: delete uploaded PDF
      await supabase.storage.from("certificates").remove([pdfPath]);

      return new Response(
        JSON.stringify({
          error: "Failed to create certificate record",
          details: certificateError,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🎉 Certificate generation complete!");

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        certificate: {
          id: certificate.id,
          certificate_id: certificateId,
          pdf_url: pdfUrl,
          storage_path: pdfPath,
          worker_name: worker.full_name,
          issue_date: issueDate.toISOString(),
          valid_until: validUntil.toISOString(),
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

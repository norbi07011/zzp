/**
 * PDF Certificate Generator Service
 * Generates ZZP Premium Certificates as PDF documents
 */

import jsPDF from "jspdf";

export interface CertificateData {
  certificateNumber: string;
  workerName: string;
  workerEmail: string;
  specializations: string[];
  testScore: number;
  testDate: string;
  issueDate: string;
  issuedBy?: string;
}

/**
 * Generate ZZP Premium Certificate PDF
 */
export async function generateZZPCertificatePDF(
  data: CertificateData
): Promise<Blob> {
  // Create new PDF document (A4 size, portrait)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryColor: [number, number, number] = [41, 98, 255]; // Blue
  const goldColor: [number, number, number] = [255, 193, 7]; // Gold
  const textColor: [number, number, number] = [33, 33, 33]; // Dark gray

  // Add decorative border
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

  // Header - Certificate Title
  doc.setFontSize(32);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("CERTYFIKAT", pageWidth / 2, 35, { align: "center" });

  doc.setFontSize(20);
  doc.setTextColor(...goldColor);
  doc.text("ZZP PREMIUM", pageWidth / 2, 45, { align: "center" });

  // Certificate Number
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Nr certyfikatu: ${data.certificateNumber}`, pageWidth / 2, 55, {
    align: "center",
  });

  // Decorative line
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(0.5);
  doc.line(40, 60, pageWidth - 40, 60);

  // Main text
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "normal");
  doc.text("Niniejszym zaświadczamy, że", pageWidth / 2, 75, {
    align: "center",
  });

  // Worker Name (highlighted)
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(data.workerName, pageWidth / 2, 90, { align: "center" });

  // Description
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "normal");
  doc.text("pomyślnie ukończył(a) egzamin ZZP Premium", pageWidth / 2, 105, {
    align: "center",
  });
  doc.text(
    "i uzyskał(a) certyfikat w następujących specjalizacjach:",
    pageWidth / 2,
    113,
    { align: "center" }
  );

  // Specializations box
  const specializationLabels: Record<string, string> = {
    forklift: "Wózki widłowe",
    warehouse: "Prace magazynowe",
    logistics: "Logistyka",
    heavy_machinery: "Ciężki sprzęt",
    inventory: "Zarządzanie zapasami",
    quality_control: "Kontrola jakości",
    picking: "Picking",
    packing: "Packing",
    shipping: "Wysyłka",
  };

  let yPosition = 125;
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(30, yPosition, pageWidth - 60, 40, 3, 3, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);

  const specs = data.specializations.map((s) => specializationLabels[s] || s);
  const specsText = specs.join(" • ");

  // Wrap text if too long
  const splitSpecs = doc.splitTextToSize(specsText, pageWidth - 70);
  doc.text(splitSpecs, pageWidth / 2, yPosition + 10, { align: "center" });

  // Test Results
  yPosition = 175;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);
  doc.text("Wynik egzaminu:", pageWidth / 2 - 30, yPosition, {
    align: "right",
  });

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...goldColor);
  doc.text(`${data.testScore}/10`, pageWidth / 2 - 25, yPosition);

  // Dates
  yPosition = 195;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  const testDate = new Date(data.testDate);
  const issueDate = new Date(data.issueDate);

  doc.text(
    `Data egzaminu: ${testDate.toLocaleDateString("pl-PL")}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  doc.text(
    `Data wystawienia: ${issueDate.toLocaleDateString("pl-PL")}`,
    pageWidth / 2,
    yPosition + 6,
    { align: "center" }
  );

  // Signature section
  yPosition = 230;
  doc.setDrawColor(150, 150, 150);
  doc.line(40, yPosition, 90, yPosition);
  doc.line(pageWidth - 90, yPosition, pageWidth - 40, yPosition);

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("Podpis egzaminatora", 65, yPosition + 6, { align: "center" });
  doc.text("Pieczęć ZZP Werkplaats", pageWidth - 65, yPosition + 6, {
    align: "center",
  });

  if (data.issuedBy) {
    doc.setFontSize(8);
    doc.text(
      `Wystawione przez: ${data.issuedBy}`,
      pageWidth / 2,
      yPosition + 12,
      { align: "center" }
    );
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "ZZP Werkplaats • Professional Certification Program",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );
  doc.text(`Email: ${data.workerEmail}`, pageWidth / 2, pageHeight - 10, {
    align: "center",
  });

  // Add decorative elements (corner ornaments)
  doc.setFillColor(...goldColor);
  // Top left corner
  doc.circle(20, 20, 2, "F");
  // Top right corner
  doc.circle(pageWidth - 20, 20, 2, "F");
  // Bottom left corner
  doc.circle(20, pageHeight - 20, 2, "F");
  // Bottom right corner
  doc.circle(pageWidth - 20, pageHeight - 20, 2, "F");

  // Return PDF as Blob
  return doc.output("blob");
}

/**
 * Download certificate PDF
 */
export function downloadCertificatePDF(
  blob: Blob,
  certificateNumber: string
): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ZZP_Certificate_${certificateNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Upload certificate PDF to Supabase storage
 */
export async function uploadCertificatePDF(
  blob: Blob,
  certificateNumber: string,
  supabaseClient: any
): Promise<string | null> {
  try {
    const fileName = `certificates/${certificateNumber}.pdf`;

    const { data, error } = await supabaseClient.storage
      .from("certificates")
      .upload(fileName, blob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from("certificates")
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  } catch (error) {
    console.error("Error uploading certificate PDF:", error);
    return null;
  }
}

export const pdfCertificateService = {
  generateZZPCertificatePDF,
  downloadCertificatePDF,
  uploadCertificatePDF,
};

# 🎓 GENERATOR CERTYFIKATÓW ZZP WERKPLAATS - PEŁNA SPECYFIKACJA

**Data:** 13 listopada 2025  
**Cel:** System generowania premium certyfikatów weryfikacji dla pracowników ZZP  
**Admin Panel:** `/admin/certificates/generate`

---

## 📋 SPIS TREŚCI

1. [JSON Design Prompt - Ultra Szczegółowy](#-json-design-prompt---ultra-szczegółowy)
2. [Wymagane Elementy Certyfikatu](#-wymagane-elementy-certyfikatu)
3. [Opcje Techniczne Implementacji (BEZ AI)](#️-opcje-techniczne-implementacji-bez-ai-models)
4. [Rekomendowana Architektura](#-rekomendowana-architektura)
5. [Database Schema](#-database-schema)
6. [UI/UX Admin Panel](#-admin-panel-uiux)

---

## 🎨 JSON DESIGN PROMPT - ULTRA SZCZEGÓŁOWY

```json
{
  "certificate_design": {
    "document_type": "Professional Skill Verification Certificate",
    "orientation": "landscape",
    "dimensions": {
      "width": "297mm",
      "height": "210mm",
      "format": "A4 Landscape",
      "dpi": 300,
      "bleed": "3mm"
    },

    "color_palette": {
      "primary": {
        "name": "Deep Navy Blue",
        "hex": "#1a2332",
        "usage": "Main background, borders, authority sections"
      },
      "accent_gold": {
        "name": "Luxurious Gold",
        "hex": "#d4af37",
        "rgb": "212, 175, 55",
        "usage": "Borders, seals, signature lines, premium accents"
      },
      "accent_cyan": {
        "name": "Tech Cyan",
        "hex": "#00d4ff",
        "usage": "Secondary highlights, hologram effects, modern touch"
      },
      "text_primary": {
        "name": "Pure White",
        "hex": "#ffffff",
        "usage": "Main text, recipient name, title"
      },
      "text_secondary": {
        "name": "Light Gray",
        "hex": "#e5e7eb",
        "usage": "Secondary information, footer details"
      },
      "seal_gradient": {
        "type": "radial-gradient",
        "colors": ["#d4af37", "#ffd700", "#d4af37"],
        "usage": "Official seal background"
      }
    },

    "background_layers": {
      "layer_1_base": {
        "type": "solid",
        "color": "#1a2332",
        "opacity": 1,
        "z_index": 0
      },
      "layer_2_hologram_watermark": {
        "type": "image",
        "source": "logo_hologram_version",
        "position": "center",
        "size": "80% width, 60% height",
        "opacity": 0.08,
        "filter": "blur(2px) brightness(1.3)",
        "blend_mode": "overlay",
        "z_index": 1,
        "description": "Subtle holographic effect - logo jako watermark, ledwo widoczny, futurystyczny efekt"
      },
      "layer_3_geometric_pattern": {
        "type": "svg_pattern",
        "pattern": "hexagonal_grid",
        "color": "#00d4ff",
        "opacity": 0.03,
        "size": "20px",
        "position": "cover",
        "z_index": 2,
        "description": "Technologiczny wzór w tle - subtelna siatka hexagonów"
      },
      "layer_4_gradient_overlay": {
        "type": "linear-gradient",
        "angle": "135deg",
        "stops": [
          { "color": "#1a2332", "position": "0%" },
          { "color": "#0a1520", "position": "50%" },
          { "color": "#1a2332", "position": "100%" }
        ],
        "opacity": 0.6,
        "z_index": 3
      }
    },

    "border_system": {
      "outer_border": {
        "type": "triple_line",
        "outer": {
          "width": "8px",
          "color": "#d4af37",
          "style": "solid",
          "corner_radius": "12px"
        },
        "middle": {
          "width": "2px",
          "color": "#ffffff",
          "style": "solid",
          "offset": "4px"
        },
        "inner": {
          "width": "1px",
          "color": "#00d4ff",
          "style": "dashed",
          "dash_pattern": "8px 4px",
          "offset": "8px"
        },
        "margin_from_edge": "15mm",
        "description": "Luksusowa złota ramka z białą i cyjanową linią wewnętrzną"
      },
      "corner_decorations": {
        "position": ["top-left", "top-right", "bottom-left", "bottom-right"],
        "type": "ornamental_flourish",
        "size": "30px x 30px",
        "color": "#d4af37",
        "style": "art_deco_geometric",
        "glow_effect": {
          "color": "#ffd700",
          "blur": "4px",
          "spread": "2px"
        }
      }
    },

    "header_section": {
      "position": "top",
      "height": "60mm",
      "background": "transparent",

      "logo_primary": {
        "type": "full_color_logo",
        "source": "zzp_werkplaats_logo.svg",
        "position": "center-top",
        "margin_top": "25mm",
        "width": "180px",
        "height": "auto",
        "filter": "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
        "z_index": 10,
        "description": "PEŁNE, wyraźne logo ZZP Werkplaats na pierwszym planie"
      },

      "logo_hologram_background": {
        "type": "hologram_effect_logo",
        "source": "zzp_werkplaats_logo.svg",
        "position": "center-top",
        "margin_top": "24mm",
        "width": "190px",
        "height": "auto",
        "opacity": 0.15,
        "filter": "blur(3px) brightness(1.5)",
        "blend_mode": "screen",
        "animation": "subtle_pulse",
        "z_index": 9,
        "description": "To samo logo TUŻA POD głównym - efekt hologramu, ledwo widoczne, świecące"
      },

      "title_main": {
        "text": "CERTIFICATE OF SKILL VERIFICATION",
        "font_family": "Playfair Display, serif",
        "font_weight": 700,
        "font_size": "36px",
        "color": "#d4af37",
        "letter_spacing": "4px",
        "text_transform": "uppercase",
        "position": "center",
        "margin_top": "90mm",
        "text_shadow": "0 2px 4px rgba(0,0,0,0.6)",
        "border_bottom": {
          "width": "3px",
          "style": "solid",
          "color": "#00d4ff",
          "width_percent": "60%",
          "margin": "8px auto"
        }
      },

      "subtitle": {
        "text": "Gecertifieiate Vakmensen voor Uw Bedrijf",
        "font_family": "Montserrat, sans-serif",
        "font_weight": 400,
        "font_size": "14px",
        "color": "#e5e7eb",
        "letter_spacing": "2px",
        "position": "center",
        "margin_top": "8px"
      }
    },

    "content_section": {
      "position": "center",
      "width": "80%",
      "margin": "auto",
      "padding": "20mm 0",

      "introduction_text": {
        "text": "This certifies that",
        "font_family": "Montserrat, sans-serif",
        "font_weight": 300,
        "font_size": "18px",
        "color": "#e5e7eb",
        "text_align": "center",
        "margin_bottom": "12px"
      },

      "recipient_name": {
        "text": "{{worker_full_name}}",
        "font_family": "Playfair Display, serif",
        "font_weight": 700,
        "font_size": "48px",
        "color": "#ffffff",
        "text_align": "center",
        "text_shadow": "0 3px 6px rgba(0,0,0,0.7)",
        "border_bottom": {
          "width": "2px",
          "style": "solid",
          "color": "#d4af37",
          "width_percent": "50%",
          "margin": "15px auto"
        },
        "description": "Imię i nazwisko pracownika - główny element certyfikatu"
      },

      "verification_text": {
        "text": "has been verified and certified by ZZP Werkplaats as a skilled professional in",
        "font_family": "Montserrat, sans-serif",
        "font_weight": 400,
        "font_size": "16px",
        "color": "#e5e7eb",
        "text_align": "center",
        "margin_bottom": "18px",
        "line_height": "1.6"
      },

      "specialization": {
        "text": "{{specialization}}",
        "font_family": "Montserrat, sans-serif",
        "font_weight": 600,
        "font_size": "28px",
        "color": "#00d4ff",
        "text_align": "center",
        "text_transform": "uppercase",
        "letter_spacing": "3px",
        "margin_bottom": "25px",
        "background": "linear-gradient(90deg, transparent, rgba(0,212,255,0.1), transparent)",
        "padding": "12px 30px",
        "border_radius": "8px"
      },

      "data_grid": {
        "layout": "three_column",
        "gap": "20px",
        "margin_top": "30px",

        "btw_sofi": {
          "label": "BTW/SOFI Number",
          "value": "{{btw_sofi_number}}",
          "icon": "🔢",
          "label_style": {
            "font_family": "Montserrat, sans-serif",
            "font_weight": 500,
            "font_size": "11px",
            "color": "#9ca3af",
            "text_transform": "uppercase",
            "letter_spacing": "1px"
          },
          "value_style": {
            "font_family": "Courier New, monospace",
            "font_weight": 600,
            "font_size": "16px",
            "color": "#ffffff",
            "margin_top": "4px"
          }
        },

        "kvk_number": {
          "label": "KVK Registration",
          "value": "{{kvk_number}}",
          "icon": "📋",
          "label_style": {
            "font_family": "Montserrat, sans-serif",
            "font_weight": 500,
            "font_size": "11px",
            "color": "#9ca3af",
            "text_transform": "uppercase",
            "letter_spacing": "1px"
          },
          "value_style": {
            "font_family": "Courier New, monospace",
            "font_weight": 600,
            "font_size": "16px",
            "color": "#ffffff",
            "margin_top": "4px"
          }
        },

        "issue_date": {
          "label": "Certificate Issued",
          "value": "{{issue_date}}",
          "icon": "📅",
          "label_style": {
            "font_family": "Montserrat, sans-serif",
            "font_weight": 500,
            "font_size": "11px",
            "color": "#9ca3af",
            "text_transform": "uppercase",
            "letter_spacing": "1px"
          },
          "value_style": {
            "font_family": "Montserrat, sans-serif",
            "font_weight": 600,
            "font_size": "16px",
            "color": "#d4af37",
            "margin_top": "4px"
          }
        }
      },

      "verification_statement": {
        "background": "rgba(0, 212, 255, 0.05)",
        "border": "1px solid rgba(0, 212, 255, 0.2)",
        "border_radius": "8px",
        "padding": "20px 30px",
        "margin_top": "35px",

        "icon": {
          "type": "shield_check",
          "color": "#d4af37",
          "size": "32px",
          "position": "top-center",
          "margin_bottom": "12px"
        },

        "title": {
          "text": "VERIFICATION STATEMENT",
          "font_family": "Montserrat, sans-serif",
          "font_weight": 700,
          "font_size": "13px",
          "color": "#00d4ff",
          "text_align": "center",
          "letter_spacing": "2px",
          "margin_bottom": "12px"
        },

        "body": {
          "text": "{{verification_reason}}",
          "placeholder": "Niniejszym potwierdzam weryfikację umiejętności budowlanych i doświadczenia zawodowego w/w pracownika. Po przeprowadzeniu szczegółowej weryfikacji referencji, certyfikatów oraz praktycznych umiejętności, zaświadczam że spełnia on najwyższe standardy jakości branży budowlanej w Holandii.",
          "font_family": "Montserrat, sans-serif",
          "font_weight": 400,
          "font_size": "13px",
          "color": "#e5e7eb",
          "text_align": "center",
          "line_height": "1.8",
          "font_style": "italic"
        }
      }
    },

    "footer_section": {
      "position": "bottom",
      "height": "70mm",
      "margin_top": "30mm",

      "signature_area": {
        "layout": "centered",
        "width": "300px",
        "margin": "auto",

        "signature_line": {
          "width": "100%",
          "border_top": "2px solid #d4af37",
          "margin_bottom": "8px"
        },

        "signature_name": {
          "text": "Platform Administrator",
          "font_family": "Playfair Display, serif",
          "font_weight": 600,
          "font_size": "18px",
          "color": "#ffffff",
          "text_align": "center"
        },

        "signature_title": {
          "text": "ZZP Werkplaats Verification Authority",
          "font_family": "Montserrat, sans-serif",
          "font_weight": 400,
          "font_size": "12px",
          "color": "#9ca3af",
          "text_align": "center",
          "margin_top": "4px"
        }
      },

      "official_seal": {
        "type": "circular_seal",
        "position": "bottom-right",
        "margin_right": "40mm",
        "margin_bottom": "25mm",
        "diameter": "80px",

        "background": {
          "type": "radial-gradient",
          "colors": ["#d4af37", "#ffd700", "#d4af37"],
          "opacity": 0.9
        },

        "border": {
          "width": "4px",
          "style": "double",
          "color": "#1a2332"
        },

        "inner_circle": {
          "diameter": "70px",
          "border": "2px solid #1a2332",
          "background": "transparent"
        },

        "text_top": {
          "text": "VERIFIED",
          "font_family": "Montserrat, sans-serif",
          "font_weight": 800,
          "font_size": "14px",
          "color": "#1a2332",
          "position": "arc-top",
          "letter_spacing": "2px"
        },

        "text_center": {
          "text": "2025",
          "font_family": "Playfair Display, serif",
          "font_weight": 700,
          "font_size": "20px",
          "color": "#1a2332",
          "position": "center"
        },

        "text_bottom": {
          "text": "ZZP WERKPLAATS",
          "font_family": "Montserrat, sans-serif",
          "font_weight": 700,
          "font_size": "9px",
          "color": "#1a2332",
          "position": "arc-bottom",
          "letter_spacing": "1px"
        },

        "checkmark_icon": {
          "type": "svg_path",
          "color": "#1a2332",
          "size": "24px",
          "position": "center",
          "opacity": 0.3
        }
      },

      "qr_code_section": {
        "position": "bottom-left",
        "margin_left": "40mm",
        "margin_bottom": "25mm",

        "qr_code": {
          "size": "80px",
          "data": "https://zzpwerkplaats.nl/verify/{{certificate_id}}",
          "error_correction": "H",
          "foreground_color": "#ffffff",
          "background_color": "transparent",
          "border": "3px solid #00d4ff",
          "border_radius": "8px",
          "padding": "8px"
        },

        "qr_label": {
          "text": "Scan to Verify",
          "font_family": "Montserrat, sans-serif",
          "font_weight": 500,
          "font_size": "10px",
          "color": "#9ca3af",
          "text_align": "center",
          "margin_top": "8px"
        }
      },

      "certificate_id": {
        "position": "bottom-center",
        "margin_bottom": "8mm",

        "label": {
          "text": "Certificate ID:",
          "font_family": "Montserrat, sans-serif",
          "font_weight": 500,
          "font_size": "9px",
          "color": "#6b7280",
          "display": "inline"
        },

        "value": {
          "text": "{{certificate_id}}",
          "font_family": "Courier New, monospace",
          "font_weight": 600,
          "font_size": "10px",
          "color": "#9ca3af",
          "display": "inline",
          "margin_left": "6px",
          "letter_spacing": "1px"
        }
      }
    },

    "premium_quality_elements": {
      "element_1_metallic_sheen": {
        "type": "gradient_overlay",
        "position": "full_document",
        "gradient": "linear-gradient(135deg, transparent 0%, rgba(212,175,55,0.05) 50%, transparent 100%)",
        "z_index": 100,
        "blend_mode": "overlay",
        "description": "Subtelny metaliczny połysk złota przechodzący przez cały dokument"
      },

      "element_2_gold_foil_effect": {
        "targets": [
          "outer_border",
          "recipient_name_underline",
          "official_seal",
          "title_main"
        ],
        "effect": "emboss",
        "depth": "2px",
        "highlight_color": "#ffd700",
        "shadow_color": "#a67c00",
        "description": "Efekt tłoczonego złota - elementy wydają się wypukłe i luksusowe"
      },

      "element_3_holographic_shimmer": {
        "target": "logo_hologram_background",
        "animation": {
          "type": "shimmer_wave",
          "duration": "4s",
          "timing": "ease-in-out",
          "iteration": "infinite",
          "keyframes": {
            "0%": { "opacity": 0.1, "filter": "blur(3px) brightness(1.3)" },
            "50%": { "opacity": 0.18, "filter": "blur(2px) brightness(1.6)" },
            "100%": { "opacity": 0.1, "filter": "blur(3px) brightness(1.3)" }
          }
        },
        "description": "Hologram pulsuje subtelnie - efekt premium certyfikatu"
      },

      "element_4_micro_text_security": {
        "position": "border_inner_perimeter",
        "text": "ZZP WERKPLAATS VERIFIED CERTIFICATE • GECERTIFICEERD VAKMENSEN • ",
        "font_size": "4px",
        "color": "#00d4ff",
        "opacity": 0.3,
        "repeat": "pattern",
        "description": "Mikro-tekst wzdłuż ramki - element zabezpieczający jak na banknotach"
      },

      "element_5_watermark_pattern": {
        "type": "repeating_pattern",
        "pattern": "zzp_logo_simplified",
        "size": "40px",
        "spacing": "80px",
        "opacity": 0.02,
        "color": "#ffffff",
        "position": "full_background",
        "z_index": 2,
        "description": "Powtarzający się watermark logo - ledwo widoczny, premium security feature"
      }
    },

    "export_settings": {
      "formats": [
        {
          "type": "PDF",
          "quality": "print",
          "color_space": "CMYK",
          "embed_fonts": true,
          "compression": "lossless"
        },
        {
          "type": "PNG",
          "dpi": 300,
          "color_space": "RGB",
          "transparency": false,
          "background": "#1a2332"
        }
      ],
      "print_settings": {
        "paper": "A4",
        "orientation": "landscape",
        "margins": "0mm",
        "bleed": "3mm",
        "color_mode": "CMYK",
        "recommended_printer": "professional_offset"
      }
    }
  }
}
```

---

## ✅ WYMAGANE ELEMENTY CERTYFIKATU

### Dane Pracownika (Obowiązkowe)

1. **Imię i Nazwisko** (`worker_full_name`)

   - Źródło: `workers.full_name`
   - Walidacja: Min 2 słowa, max 100 znaków

2. **BTW/SOFI Number** (`btw_sofi_number`)

   - Źródło: `workers.btw_number` OR `workers.sofi_number`
   - Format: NL123456789B01 (BTW) lub 123456789 (SOFI)

3. **KVK Number** (`kvk_number`)

   - Źródło: `workers.kvk_number`
   - Format: 8 cyfr (12345678)

4. **Specjalizacja** (`specialization`)
   - Źródło: `workers.specialization`
   - Lista: Stolarka, Elektryka, Hydraulika, Malowanie, etc.

### Dane Certyfikatu (Generowane)

5. **Data Wydania** (`issue_date`)

   - Format: "13 November 2025"
   - Auto-generowane: `new Date().toLocaleDateString('nl-NL')`

6. **Certificate ID** (`certificate_id`)

   - Format: `ZZP-2025-XXXXX`
   - Generowanie: `ZZP-${year}-${5-digit-sequential}`
   - Przykład: `ZZP-2025-00142`

7. **Powód Weryfikacji** (`verification_reason`)
   - Źródło: Admin input (textarea)
   - Max: 500 znaków
   - Przykład: "Pracownik wykazał się doskonałymi umiejętnościami w montażu instalacji elektrycznych. Zweryfikowano certyfikaty VCA, referencje od 3 firm oraz praktyczne umiejętności podczas testu montażowego."

### Elementy Graficzne

8. **Logo ZZP Werkplaats**

   - Wersja pełna: Na pierwszym planie (100% opacity)
   - Wersja hologram: Pod spodem (15% opacity, blur, glow)

9. **QR Code**

   - URL: `https://zzpwerkplaats.nl/verify/{certificate_id}`
   - Prowadzi do: Strona weryfikacji certyfikatu (public)

10. **Official Seal**
    - Złota pieczęć z napisem "VERIFIED 2025"
    - Logo ZZP w środku (watermark)

---

## 🛠️ OPCJE TECHNICZNE IMPLEMENTACJI (BEZ AI MODELS)

### ✅ OPCJA 1: HTML/CSS → PDF (Puppeteer) - **REKOMENDOWANE**

**Stack:**

- React component → renderuje HTML certyfikatu
- Puppeteer (headless Chrome) → konwertuje do PDF
- Supabase Edge Function → generowanie server-side

**Plusy:**

- ✅ Pełna kontrola nad stylingiem (CSS flexbox, grid, animations)
- ✅ Łatwe do debugowania (preview w przeglądarce)
- ✅ Wysoka jakość PDF (Chrome rendering engine)
- ✅ Responsywne - łatwo zmieniać layout
- ✅ Web fonts (Google Fonts)

**Minusy:**

- ❌ Wymaga headless browser (resource-heavy)
- ❌ Wolniejsze niż pure SVG (5-10s per certificate)

**Implementacja:**

```typescript
// Supabase Edge Function: generate-certificate
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

async function generateCertificatePDF(data: CertificateData) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set viewport for A4 landscape
  await page.setViewport({ width: 1123, height: 794 }); // A4 @ 96 DPI

  // Render React component as HTML string
  const html = renderCertificateHTML(data);
  await page.setContent(html);

  // Generate PDF
  const pdf = await page.pdf({
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  return pdf;
}
```

**Koszt:** ~2-3h implementacji, 100% control over design

---

### ✅ OPCJA 2: React-PDF (@react-pdf/renderer) - **NAJPROSTSZE**

**Stack:**

- `@react-pdf/renderer` library
- React components → PDF primitives
- Client-side lub server-side rendering

**Plusy:**

- ✅ Pure React (familiar syntax)
- ✅ No external dependencies (no Puppeteer)
- ✅ Lightweight i szybkie (1-2s per certificate)
- ✅ Works w przeglądarce (client-side preview)

**Minusy:**

- ❌ Limited CSS support (nie wszystkie properties)
- ❌ Trudniejsze zaawansowane layouty
- ❌ Custom fonts wymagają ręcznego embedowania

**Implementacja:**

```typescript
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#1a2332",
    padding: 40,
  },
  title: {
    fontSize: 36,
    color: "#d4af37",
    textAlign: "center",
    letterSpacing: 4,
    fontFamily: "Playfair Display",
  },
  // ... more styles
});

export const CertificatePDF = ({ data }: Props) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Image src="/logo.png" style={styles.logo} />
      <Text style={styles.title}>CERTIFICATE OF SKILL VERIFICATION</Text>
      <Text style={styles.name}>{data.worker_full_name}</Text>
      {/* ... */}
    </Page>
  </Document>
);
```

**Koszt:** ~1-2h implementacji, 80% design fidelity

---

### ✅ OPCJA 3: Canvas API → PNG/PDF - **FULL CONTROL**

**Stack:**

- HTML5 Canvas API
- `jsPDF` for PDF conversion
- Custom drawing functions

**Plusy:**

- ✅ Pixel-perfect control
- ✅ Custom gradients, blurs, effects
- ✅ Works client-side (no server needed)
- ✅ Can add animations (animated preview)

**Minusy:**

- ❌ Więcej kodu (manual drawing)
- ❌ Trudniejsze pozycjonowanie tekstu
- ❌ Text rendering quality (trzeba obsłużyć ręcznie)

**Implementacja:**

```typescript
const canvas = document.createElement("canvas");
canvas.width = 3370; // A4 landscape @ 300 DPI
canvas.height = 2384;
const ctx = canvas.getContext("2d")!;

// Background
ctx.fillStyle = "#1a2332";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Logo
const logo = await loadImage("/logo.png");
ctx.drawImage(logo, 1500, 200, 370, 150);

// Title
ctx.font = "bold 120px Playfair Display";
ctx.fillStyle = "#d4af37";
ctx.textAlign = "center";
ctx.fillText("CERTIFICATE OF SKILL VERIFICATION", 1685, 600);

// Convert to PDF
const pdf = new jsPDF({
  orientation: "landscape",
  unit: "px",
  format: [3370, 2384],
});
pdf.addImage(canvas.toDataURL(), "PNG", 0, 0);
```

**Koszt:** ~4-5h implementacji, 100% design control

---

### ✅ OPCJA 4: SVG → PDF Conversion - **NAJBARDZIEJ SKALOWALNE**

**Stack:**

- SVG template with placeholders
- String replacement for data injection
- `svg2pdf.js` for conversion

**Plusy:**

- ✅ Vector graphics (infinite scaling)
- ✅ Small file size
- ✅ Easy to version control (SVG = text file)
- ✅ Can edit in Figma/Illustrator

**Minusy:**

- ❌ Complex layouts trudne w SVG
- ❌ Text wrapping manually
- ❌ Limited web font support

**Implementacja:**

```typescript
import { svg2pdf } from "svg2pdf.js";
import { jsPDF } from "jspdf";

const svgTemplate = `
<svg width="297mm" height="210mm" viewBox="0 0 297 210">
  <rect fill="#1a2332" width="297" height="210"/>
  <text x="148.5" y="30" fill="#d4af37" font-size="12" text-anchor="middle">
    CERTIFICATE OF SKILL VERIFICATION
  </text>
  <text x="148.5" y="60" fill="#ffffff" font-size="16" text-anchor="middle">
    {{worker_full_name}}
  </text>
  <!-- ... more SVG elements -->
</svg>
`;

const filledSVG = svgTemplate
  .replace("{{worker_full_name}}", data.worker_full_name)
  .replace("{{btw_sofi_number}}", data.btw_sofi_number);

const doc = new jsPDF({ orientation: "landscape", format: "a4" });
await svg2pdf(filledSVG, doc, { x: 0, y: 0 });
```

**Koszt:** ~3-4h implementacji, 90% design fidelity

---

### ✅ OPCJA 5: PDFKit (Node.js) - **SERVER-SIDE PURE**

**Stack:**

- PDFKit library (pure Node.js)
- Programmatic PDF generation
- Deno-compatible version exists

**Plusy:**

- ✅ No browser needed (pure server-side)
- ✅ Bardzo szybkie (sub-second generation)
- ✅ Low memory footprint
- ✅ Stream-based (for large batches)

**Minusy:**

- ❌ Manual positioning wszystkiego
- ❌ Więcej boilerplate code
- ❌ Limited visual debugging

**Implementacja:**

```typescript
import PDFDocument from "pdfkit";

const doc = new PDFDocument({
  size: "A4",
  layout: "landscape",
  margin: 0,
});

// Background
doc.rect(0, 0, 842, 595).fill("#1a2332");

// Logo
doc.image("logo.png", 300, 50, { width: 242 });

// Title
doc
  .fontSize(36)
  .fillColor("#d4af37")
  .font("fonts/PlayfairDisplay-Bold.ttf")
  .text("CERTIFICATE OF SKILL VERIFICATION", 0, 150, { align: "center" });

// Name
doc
  .fontSize(48)
  .fillColor("#ffffff")
  .text(data.worker_full_name, 0, 220, { align: "center" });

doc.end();
```

**Koszt:** ~2-3h implementacji, 85% design fidelity

---

## 🏆 REKOMENDOWANA ARCHITEKTURA

### **WYBÓR: Opcja 1 (HTML/CSS → PDF via Puppeteer)**

**Dlaczego:**

1. **Najłatwiejszy design workflow** - używasz normalnego CSS
2. **Easy debugging** - preview w przeglądarce
3. **Best quality** - Chrome rendering engine
4. **Flexible** - łatwo dodać nowe elementy

**Stack:**

```
┌─────────────────────────────────────────┐
│   ADMIN PANEL (React)                   │
│   /admin/certificates/generate          │
│                                          │
│   [Form: Select Worker]                 │
│   [Input: Verification Reason]          │
│   [Button: Preview]                     │
│   [Button: Generate & Download]         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   REACT COMPONENT                       │
│   CertificateTemplate.tsx               │
│                                          │
│   - Otrzymuje worker data               │
│   - Renderuje HTML z pełnym CSS         │
│   - Export jako HTML string             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   SUPABASE EDGE FUNCTION                │
│   generate-certificate                  │
│                                          │
│   1. Otrzymuje HTML + data              │
│   2. Launches Puppeteer                 │
│   3. Renders HTML → PDF                 │
│   4. Uploads to Supabase Storage        │
│   5. Creates database record            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   SUPABASE STORAGE                      │
│   Bucket: certificates                  │
│                                          │
│   /2025/ZZP-2025-00142.pdf             │
│   Public URL for download               │
└─────────────────────────────────────────┘
```

---

## 💾 DATABASE SCHEMA

### Nowa tabela: `certificates`

```sql
CREATE TABLE certificates (
  -- Primary
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id VARCHAR UNIQUE NOT NULL, -- ZZP-2025-00142

  -- Worker Reference
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  worker_full_name VARCHAR NOT NULL, -- Snapshot (gdyby worker zmienił imię)
  worker_btw_sofi VARCHAR NOT NULL,
  worker_kvk VARCHAR NOT NULL,
  worker_specialization VARCHAR NOT NULL,

  -- Certificate Details
  verification_reason TEXT NOT NULL, -- Admin input
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE, -- NULL = lifetime validity

  -- File Storage
  pdf_url TEXT NOT NULL, -- Supabase Storage public URL
  pdf_storage_path TEXT NOT NULL, -- certificates/2025/ZZP-2025-00142.pdf

  -- Metadata
  issued_by_admin_id UUID REFERENCES profiles(id),
  issued_by_admin_name VARCHAR,

  -- Status
  status VARCHAR DEFAULT 'active', -- active, revoked, expired
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,

  -- Verification
  qr_code_scans INTEGER DEFAULT 0,
  last_verified_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_certificates_worker ON certificates(worker_id);
CREATE INDEX idx_certificates_cert_id ON certificates(certificate_id);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_issue_date ON certificates(issue_date DESC);

-- RLS Policies
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admins manage certificates"
  ON certificates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Workers view own certificates
CREATE POLICY "Workers view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (worker_id IN (
    SELECT id FROM workers WHERE profile_id = auth.uid()
  ));

-- Public verification (QR code scan)
CREATE POLICY "Public verify certificates"
  ON certificates FOR SELECT
  TO anon
  USING (status = 'active');

-- Sequential ID function
CREATE SEQUENCE certificate_sequence START 1;

CREATE OR REPLACE FUNCTION generate_certificate_id()
RETURNS VARCHAR AS $$
DECLARE
  year_suffix VARCHAR := TO_CHAR(CURRENT_DATE, 'YYYY');
  seq_num INTEGER;
  cert_id VARCHAR;
BEGIN
  seq_num := nextval('certificate_sequence');
  cert_id := 'ZZP-' || year_suffix || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN cert_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate certificate_id
CREATE TRIGGER auto_certificate_id
  BEFORE INSERT ON certificates
  FOR EACH ROW
  WHEN (NEW.certificate_id IS NULL)
  EXECUTE FUNCTION set_certificate_id();

CREATE OR REPLACE FUNCTION set_certificate_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.certificate_id := generate_certificate_id();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎨 ADMIN PANEL UI/UX

### Route: `/admin/certificates`

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  ZZP WERKPLAATS - Certificate Generator                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Statistics                                               │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │ Total    │ Active   │ Revoked  │ This     │             │
│  │ 142      │ 138      │ 4        │ Month 23 │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
│                                                              │
│  [➕ Generate New Certificate]  [📋 View All Certificates]  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  GENERATE NEW CERTIFICATE                                   │
│                                                              │
│  Step 1: Select Worker                                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🔍 Search workers...                                   │ │
│  │ ▼ Jan de Vries (Stolarka) - KVK: 12345678            │ │
│  │   Piet Jansen (Elektryka) - KVK: 87654321            │ │
│  │   ...                                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Selected: [Jan de Vries]                                   │
│  • BTW/SOFI: NL123456789B01                                 │
│  • KVK: 12345678                                             │
│  • Specialization: Stolarka                                 │
│                                                              │
│  Step 2: Verification Details                               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Powód weryfikacji (max 500 znaków):                   │ │
│  │                                                        │ │
│  │ Niniejszym potwierdzam weryfikację...                 │ │
│  │                                                        │ │
│  │                                                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  📅 Issue Date: [13-11-2025] (auto)                         │
│  📅 Valid Until: [Lifetime ▼] or [Custom Date]              │
│                                                              │
│  [👁️ Preview Certificate]  [✅ Generate & Download]        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Modal: Certificate Preview

```
┌─────────────────────────────────────────────────────────────┐
│  Certificate Preview                                    [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  │  [Certificate rendered as image/iframe]                ││
│  │                                                         ││
│  │  - Logo visible                                         ││
│  │  - Worker name: JAN DE VRIES                           ││
│  │  - Specialization: STOLARKA                            ││
│  │  - BTW, KVK, Date visible                              ││
│  │  - Verification statement shown                        ││
│  │  - QR code, seal, signature visible                    ││
│  │                                                         ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│  ⚠️ Preview mode - watermark visible                        │
│                                                              │
│  [⬅️ Edit]  [✅ Looks Good - Generate PDF]                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Page: All Certificates (`/admin/certificates/list`)

```
┌─────────────────────────────────────────────────────────────┐
│  All Issued Certificates (142 total)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Search: [___________]  Status: [All ▼]  Year: [2025 ▼] │
│                                                              │
│  ┌────┬────────────┬──────────┬──────────┬──────┬────────┐ │
│  │ ID │ Worker     │ Special. │ Issued   │Status│ Action │ │
│  ├────┼────────────┼──────────┼──────────┼──────┼────────┤ │
│  │142 │Jan de Vries│ Stolarka │13-11-2025│Active│📄 👁️ 🗑️│ │
│  │141 │Piet Jansen │Elektryka │12-11-2025│Active│📄 👁️ 🗑️│ │
│  │140 │Kees Bakker │Hydraulika│11-11-2025│Revoked│📄 👁️  │ │
│  │... │...         │...       │...       │...   │...     │ │
│  └────┴────────────┴──────────┴──────────┴──────┴────────┘ │
│                                                              │
│  📄 = Download PDF                                           │
│  👁️ = View Details                                          │
│  🗑️ = Revoke Certificate                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Database Setup (30 min)

- [ ] Create `certificates` table migration
- [ ] Add sequential ID function
- [ ] Setup RLS policies
- [ ] Test certificate_id generation

### Phase 2: React Certificate Component (2h)

- [ ] Create `CertificateTemplate.tsx`
- [ ] Implement all design elements from JSON
- [ ] Add Google Fonts (Playfair Display, Montserrat)
- [ ] Style with Tailwind + custom CSS
- [ ] Test with mock data
- [ ] Export HTML rendering function

### Phase 3: Supabase Edge Function (2h)

- [ ] Create `generate-certificate` function
- [ ] Setup Puppeteer/Deno integration
- [ ] HTML → PDF conversion
- [ ] Upload to Supabase Storage
- [ ] Return public URL
- [ ] Error handling & logging

### Phase 4: Admin Panel UI (3h)

- [ ] Create `/admin/certificates` route
- [ ] Worker selection dropdown (search)
- [ ] Verification reason textarea
- [ ] Preview modal
- [ ] Generate button + loading state
- [ ] Download PDF functionality
- [ ] Success notification

### Phase 5: Certificate List & Management (1.5h)

- [ ] `/admin/certificates/list` page
- [ ] DataTable with search/filters
- [ ] Download action
- [ ] View details modal
- [ ] Revoke certificate action
- [ ] Pagination

### Phase 6: Public Verification Page (1h)

- [ ] `/verify/:certificate_id` route
- [ ] QR code scan landing page
- [ ] Display certificate details
- [ ] "Verified ✅" or "Invalid ❌" status
- [ ] Increment `qr_code_scans` counter

---

## 🔐 SECURITY CONSIDERATIONS

1. **RLS Policies:**

   - Admins: Full CRUD
   - Workers: Read own certificates
   - Public: Verify active certificates only

2. **Rate Limiting:**

   - Max 10 certificates per admin per hour
   - Prevent abuse

3. **PDF Watermarks:**

   - Preview mode: "PREVIEW - NOT OFFICIAL"
   - Only final PDF is watermark-free

4. **Certificate Revocation:**

   - Soft delete (status = 'revoked')
   - Keep record for audit trail
   - Reason required

5. **QR Code Security:**
   - UUID-based cert IDs (hard to guess)
   - Public verification doesn't expose worker personal data
   - Only shows: Name, Specialization, Status

---

## 📊 ESTIMATED TIME

| Task                          | Time         |
| ----------------------------- | ------------ |
| Database Schema               | 30 min       |
| React Certificate Component   | 2h           |
| Supabase Edge Function        | 2h           |
| Admin Panel UI                | 3h           |
| Certificate List & Management | 1.5h         |
| Public Verification Page      | 1h           |
| Testing & Debugging           | 1h           |
| **TOTAL**                     | **11 hours** |

---

## ✅ SUCCESS CRITERIA

Certificate MUST zawierać:

- ✅ Podwójne logo (full + hologram)
- ✅ Imię i nazwisko pracownika (duże, centralne)
- ✅ BTW/SOFI number
- ✅ KVK number
- ✅ Specjalizacja (highlight)
- ✅ Data wydania
- ✅ Notatka weryfikacyjna (admin input)
- ✅ QR code (verification URL)
- ✅ Official seal (złota pieczęć)
- ✅ Signature line
- ✅ Certificate ID (unique)
- ✅ 5 premium elements (metallic sheen, gold foil, hologram shimmer, micro-text, watermark)

Quality MUST be:

- ✅ Print-ready (300 DPI)
- ✅ A4 Landscape
- ✅ Professional design (executive level)
- ✅ Unique (nie wygląda jak template)

---

## 🎯 NEXT STEPS

1. **Review this spec** - czy wszystko się zgadza?
2. **Approve design** - JSON prompt zawiera wszystkie elementy?
3. **Choose implementation** - Puppeteer (recommended) or React-PDF?
4. **Start Phase 1** - Database setup

**Potrzebujesz jeszcze czegoś do specyfikacji?**

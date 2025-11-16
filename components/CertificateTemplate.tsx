import React from "react";

interface CertificateData {
  worker_full_name: string;
  worker_btw_sofi: string;
  worker_kvk: string;
  worker_specialization: string;
  verification_reason: string;
  issue_date: string; // Format: "13 November 2025"
  certificate_id: string; // Format: "ZZP-2025-00142"
}

interface CertificateTemplateProps {
  data: CertificateData;
  isPreview?: boolean;
}

export const CertificateTemplate: React.FC<CertificateTemplateProps> = ({
  data,
  isPreview = false,
}) => {
  const qrCodeUrl = `https://zzpwerkplaats.nl/verify/${data.certificate_id}`;

  return (
    <div
      className="certificate-container"
      style={{
        width: "297mm",
        height: "210mm",
        position: "relative",
        backgroundColor: "#1a2332",
        fontFamily: "'Montserrat', sans-serif",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Background Layers */}
      <div
        className="hologram-watermark"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "60%",
          opacity: 0.08,
          filter: "blur(2px) brightness(1.3)",
          backgroundImage: "url(/logo.svg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          mixBlendMode: "overlay",
          zIndex: 1,
        }}
      />

      {/* Hexagonal Grid Pattern */}
      <div
        className="geometric-pattern"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.03,
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 20px,
            #00d4ff 20px,
            #00d4ff 21px
          ),
          repeating-linear-gradient(
            60deg,
            transparent,
            transparent 20px,
            #00d4ff 20px,
            #00d4ff 21px
          ),
          repeating-linear-gradient(
            120deg,
            transparent,
            transparent 20px,
            #00d4ff 20px,
            #00d4ff 21px
          )`,
          zIndex: 2,
        }}
      />

      {/* Gradient Overlay */}
      <div
        className="gradient-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #1a2332 0%, #0a1520 50%, #1a2332 100%)",
          opacity: 0.6,
          zIndex: 3,
        }}
      />

      {/* Main Content Container */}
      <div
        className="content"
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
          padding: "15mm",
          boxSizing: "border-box",
        }}
      >
        {/* Triple Border System */}
        <div
          className="border-outer"
          style={{
            position: "absolute",
            top: "15mm",
            left: "15mm",
            right: "15mm",
            bottom: "15mm",
            border: "8px solid #d4af37",
            borderRadius: "12px",
            boxShadow: "0 0 20px rgba(212, 175, 55, 0.5)",
            zIndex: 5,
          }}
        />
        <div
          className="border-middle"
          style={{
            position: "absolute",
            top: "19mm",
            left: "19mm",
            right: "19mm",
            bottom: "19mm",
            border: "2px solid #ffffff",
            borderRadius: "8px",
            zIndex: 6,
          }}
        />
        <div
          className="border-inner"
          style={{
            position: "absolute",
            top: "23mm",
            left: "23mm",
            right: "23mm",
            bottom: "23mm",
            border: "1px dashed #00d4ff",
            borderRadius: "4px",
            zIndex: 7,
          }}
        />

        {/* Corner Decorations */}
        {["top-left", "top-right", "bottom-left", "bottom-right"].map(
          (position) => (
            <div
              key={position}
              className={`corner-decoration-${position}`}
              style={{
                position: "absolute",
                width: "30px",
                height: "30px",
                ...(position.includes("top")
                  ? { top: "12mm" }
                  : { bottom: "12mm" }),
                ...(position.includes("left")
                  ? { left: "12mm" }
                  : { right: "12mm" }),
                color: "#d4af37",
                fontSize: "30px",
                filter: "drop-shadow(0 0 4px #ffd700)",
                zIndex: 8,
              }}
            >
              ✦
            </div>
          )
        )}

        {/* Header Section */}
        <div
          className="header"
          style={{
            position: "relative",
            textAlign: "center",
            paddingTop: "25mm",
            zIndex: 10,
          }}
        >
          {/* Logo Hologram Background */}
          <div
            style={{
              position: "absolute",
              top: "24mm",
              left: "50%",
              transform: "translateX(-50%)",
              width: "190px",
              height: "auto",
              opacity: 0.15,
              filter: "blur(3px) brightness(1.5)",
              mixBlendMode: "screen",
              zIndex: 9,
            }}
          >
            <img
              src="/logo.svg"
              alt="ZZP Werkplaats Logo Hologram"
              style={{ width: "100%", height: "auto" }}
            />
          </div>

          {/* Primary Logo */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
            }}
          >
            <img
              src="/logo.svg"
              alt="ZZP Werkplaats"
              style={{ width: "180px", height: "auto" }}
            />
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "36px",
              fontWeight: 700,
              color: "#d4af37",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginTop: "20mm",
              marginBottom: "8px",
              textShadow: "0 2px 4px rgba(0,0,0,0.6)",
            }}
          >
            CERTIFICATE OF SKILL VERIFICATION
          </h1>

          {/* Title Underline */}
          <div
            style={{
              width: "60%",
              height: "3px",
              backgroundColor: "#00d4ff",
              margin: "8px auto",
            }}
          />

          {/* Subtitle */}
          <p
            style={{
              fontSize: "14px",
              color: "#e5e7eb",
              letterSpacing: "2px",
              marginTop: "8px",
            }}
          >
            Gecertificeerde Vakmensen voor Uw Bedrijf
          </p>
        </div>

        {/* Content Section */}
        <div
          className="main-content"
          style={{
            position: "relative",
            width: "80%",
            margin: "20mm auto 0",
            zIndex: 10,
          }}
        >
          {/* Introduction */}
          <p
            style={{
              fontSize: "18px",
              fontWeight: 300,
              color: "#e5e7eb",
              textAlign: "center",
              marginBottom: "12px",
            }}
          >
            This certifies that
          </p>

          {/* Worker Name */}
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "48px",
              fontWeight: 700,
              color: "#ffffff",
              textAlign: "center",
              textShadow: "0 3px 6px rgba(0,0,0,0.7)",
              marginBottom: "15px",
            }}
          >
            {data.worker_full_name.toUpperCase()}
          </h2>

          {/* Name Underline */}
          <div
            style={{
              width: "50%",
              height: "2px",
              backgroundColor: "#d4af37",
              margin: "0 auto 15px",
            }}
          />

          {/* Verification Text */}
          <p
            style={{
              fontSize: "16px",
              color: "#e5e7eb",
              textAlign: "center",
              lineHeight: "1.6",
              marginBottom: "18px",
            }}
          >
            has been verified and certified by ZZP Werkplaats as a skilled
            professional in
          </p>

          {/* Specialization */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#00d4ff",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "3px",
              background:
                "linear-gradient(90deg, transparent, rgba(0,212,255,0.1), transparent)",
              padding: "12px 30px",
              borderRadius: "8px",
              marginBottom: "25px",
            }}
          >
            {data.worker_specialization}
          </div>

          {/* Data Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              marginTop: "30px",
              marginBottom: "35px",
            }}
          >
            {/* BTW/SOFI */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "4px",
                }}
              >
                🔢 BTW/SOFI Number
              </div>
              <div
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                {data.worker_btw_sofi}
              </div>
            </div>

            {/* KVK */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "4px",
                }}
              >
                📋 KVK Registration
              </div>
              <div
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                {data.worker_kvk}
              </div>
            </div>

            {/* Issue Date */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "4px",
                }}
              >
                📅 Certificate Issued
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#d4af37",
                }}
              >
                {data.issue_date}
              </div>
            </div>
          </div>

          {/* Verification Statement Box */}
          <div
            style={{
              background: "rgba(0, 212, 255, 0.05)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              borderRadius: "8px",
              padding: "20px 30px",
              marginTop: "35px",
            }}
          >
            {/* Shield Icon */}
            <div
              style={{
                textAlign: "center",
                fontSize: "32px",
                color: "#d4af37",
                marginBottom: "12px",
              }}
            >
              🛡️
            </div>

            {/* Statement Title */}
            <h3
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#00d4ff",
                textAlign: "center",
                letterSpacing: "2px",
                marginBottom: "12px",
              }}
            >
              VERIFICATION STATEMENT
            </h3>

            {/* Statement Body */}
            <p
              style={{
                fontSize: "13px",
                fontWeight: 400,
                color: "#e5e7eb",
                textAlign: "center",
                lineHeight: "1.8",
                fontStyle: "italic",
              }}
            >
              {data.verification_reason}
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <div
          className="footer"
          style={{
            position: "absolute",
            bottom: "15mm",
            left: "15mm",
            right: "15mm",
            zIndex: 10,
          }}
        >
          {/* Signature Area */}
          <div
            style={{
              width: "300px",
              margin: "0 auto 30px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                borderTop: "2px solid #d4af37",
                marginBottom: "8px",
              }}
            />
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px",
                fontWeight: 600,
                color: "#ffffff",
              }}
            >
              Platform Administrator
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                marginTop: "4px",
              }}
            >
              ZZP Werkplaats Verification Authority
            </div>
          </div>

          {/* Bottom Row: QR Code, Certificate ID, Official Seal */}
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            {/* QR Code - Left */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  border: "3px solid #00d4ff",
                  borderRadius: "8px",
                  padding: "8px",
                  backgroundColor: "white",
                }}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                    qrCodeUrl
                  )}`}
                  alt="QR Code"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#9ca3af",
                  marginTop: "8px",
                }}
              >
                Scan to Verify
              </div>
            </div>

            {/* Certificate ID - Center */}
            <div style={{ textAlign: "center", flex: 1 }}>
              <span
                style={{
                  fontSize: "9px",
                  color: "#6b7280",
                  marginRight: "6px",
                }}
              >
                Certificate ID:
              </span>
              <span
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#9ca3af",
                  letterSpacing: "1px",
                }}
              >
                {data.certificate_id}
              </span>
            </div>

            {/* Official Seal - Right */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, #ffd700 0%, #d4af37 50%, #ffd700 100%)",
                border: "4px double #1a2332",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                opacity: 0.9,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "70px",
                  height: "70px",
                  border: "2px solid #1a2332",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#1a2332",
                  textAlign: "center",
                }}
              >
                VERIFIED
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#1a2332",
                }}
              >
                2025
              </div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#1a2332",
                  letterSpacing: "1px",
                }}
              >
                ZZP WERKPLAATS
              </div>
            </div>
          </div>
        </div>

        {/* Preview Watermark */}
        {isPreview && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-45deg)",
              fontSize: "80px",
              fontWeight: 900,
              color: "rgba(255, 0, 0, 0.15)",
              textTransform: "uppercase",
              letterSpacing: "10px",
              zIndex: 100,
              pointerEvents: "none",
            }}
          >
            PREVIEW
          </div>
        )}
      </div>

      {/* Metallic Sheen Overlay */}
      <div
        className="metallic-sheen"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, transparent 0%, rgba(212,175,55,0.05) 50%, transparent 100%)",
          mixBlendMode: "overlay",
          zIndex: 100,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default CertificateTemplate;

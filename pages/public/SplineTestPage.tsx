import React, { Suspense } from "react";
import Spline from "@splinetool/react-spline";
import { Link } from "react-router-dom";

export default function SplineTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Spline 3D Animation - pełny ekran */}
      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-white text-2xl animate-pulse">
                Ładowanie animacji 3D...
              </div>
            </div>
          }
        >
          <Spline scene="https://prod.spline.design/oMjMonRI7Wxe0hCx/scene.splinecode" />
        </Suspense>
      </div>

      {/* Minimalistyczny overlay - tylko logo i tagline */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pointer-events-none">
        <div className="text-center space-y-8">
          {/* Logo ZZP Werkplaats */}
          <div className="mb-4">
            <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 drop-shadow-2xl animate-pulse">
              ZZP Werkplaats
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
            Jouw Platform voor Gecertificeerde Vakmensen
          </p>

          {/* Przycisk powrotu */}
          <div className="mt-12 pointer-events-auto">
            <Link
              to="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-cyan-500/50 hover:scale-110 transition-all duration-300"
            >
              ← Powrót do Strony Głównej
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

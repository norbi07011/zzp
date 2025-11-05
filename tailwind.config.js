/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          400: '#00d9ff',
          500: '#00b8e6',
        },
        success: {
          400: '#00ff88',
          500: '#00cc66',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, #00d9ff 0%, #0066ff 100%)',
        'gradient-success': 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)',
        'gradient-premium': 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
      },
      boxShadow: {
        'glow-cyber': '0 0 20px rgba(0, 217, 255, 0.3)',
        'glow-success': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-premium': '0 0 20px rgba(255, 107, 107, 0.3)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}


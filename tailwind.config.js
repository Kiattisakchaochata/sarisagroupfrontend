// tailwind.config.js  (ESM)
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          primary: "#0071e3",
          black: "#111111",
          white: "#ffffff",
          grayLight: "#f5f5f7",
          gray: "#e5e5ea",
        },
        // === Luxury palette ===
        brand: {
          // โทนหลัก: navy หรูและอ่านง่าย
          navy:  "#0f172a",   // bg / header
          ink:   "#111827",   // body text
          // ทอง: ใช้เป็น accent (hover, เส้นเน้น)
          gold:  "#d4af37",
          goldSoft: "#f3e7c5",
          // พื้นหลังนุ่ม ๆ
          mist:  "#f8fafc",
          // ปุ่ม / ลิงก์
          primary: "#1d4ed8", // royal-blue ผู้ใหญ่หน่อย
          primaryDark: "#153eaa",
        },
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(0,0,0,.08)',
      },
      borderRadius: {
        'pill': '9999px',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
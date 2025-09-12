export function cleanErrorText(raw: string | unknown) {
  if (!raw) return '';
  let s = typeof raw === 'string' ? raw : String(raw);
  s = s.replace(/<[^>]+>/g, ' ');       // ตัด tag
  s = s.replace(/&nbsp;/g, ' ').trim(); // แทน nbsp
  // ดึงประโยคหลัง "Error:" ถ้ามี
  const m = s.match(/Error:\s*([^\n]+)/i);
  return (m?.[1] || s).trim();
}
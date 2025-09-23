// ใช้เฉพาะฝั่ง server เท่านั้น
import 'server-only';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || 'http://localhost:8877';

// ดึง Global SEO
export async function fetchSiteSeo() {
  const res = await fetch(`${API_BASE}/api/admin/seo/site`, { // ถ้าคุณมี public endpoint ให้สลับมาใช้ public ได้
    // ถ้ามี public endpoint แนะนำเปลี่ยนเป็น /api/seo/site (ไม่ต้องส่ง cookie)
    cache: 'no-store',
    // credentials/cookies: ถ้าหลังบ้านล็อกอินเท่านั้น ให้ทำ public endpoint สำหรับอ่านแทน
  });
  if (!res.ok) return {};
  return res.json(); // { meta_title, meta_description, keywords, og_image, jsonld }
}

// ดึง Page SEO จาก path
export async function fetchPageSeo(path: string) {
  const res = await fetch(`${API_BASE}/api/admin/seo/page?path=${encodeURIComponent(path)}`, {
    cache: 'no-store',
  });
  if (!res.ok) return {};
  return res.json(); // { path, title, description, og_image, noindex, jsonld }
}

// รวมค่า + สร้าง metadata fields สำหรับ Next
export async function buildSeoForPath(pathname: string) {
  const [site, page] = await Promise.all([
    fetchSiteSeo(),
    fetchPageSeo(pathname),
  ]);

  // title/description
  const title = (page?.title || site?.meta_title || '') as string;
  const description = (page?.description || site?.meta_description || '') as string;

  // images: เอา 4 รูปจาก page ก่อน ถ้าไม่มีใช้ของ global
  const fromPage = Array.isArray(page?.jsonld?.image) ? page.jsonld.image : [];
  const fromSite = Array.isArray(site?.jsonld?.image) ? site.jsonld.image : [];
  const images: string[] = [
    ...(fromPage as string[]),
    ...(fromSite as string[]),
    page?.og_image,
    site?.og_image,
  ].filter(Boolean) as string[];
  const uniqImages = Array.from(new Set(images)).slice(0, 4);

  // keywords (จาก global)
  const keywords = (site?.keywords || '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  // noindex ถ้าหน้านั้นติ๊กไว้
  const robots = page?.noindex ? { index: false, follow: false } : undefined;

  // JSON-LD: รวมแบบชัดเจน
  const jsonldSite = (site?.jsonld && typeof site.jsonld === 'object') ? site.jsonld : {};
  const jsonldPage = (page?.jsonld && typeof page.jsonld === 'object') ? page.jsonld : {};

  // บังคับให้มี image[] ที่รวมกันแล้ว
  const mergedJsonLd = {
    ...(jsonldSite || {}),
    ...(jsonldPage || {}),
    image: uniqImages,
  };

  return {
    title,
    description,
    keywords,
    robots,
    images: uniqImages,
    jsonld: mergedJsonLd,
  };
}
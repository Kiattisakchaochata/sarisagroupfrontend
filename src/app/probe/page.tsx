export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ProbePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Probe: JSON-LD should appear in view-source</h1>
      <p>เปิดที่ <code>/probe</code> แล้วเช็ค view-source</p>
    </main>
  );
}
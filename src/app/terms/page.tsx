// app/terms/page.tsx
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
    headers: { accept: "application/json" },
    cache: "force-cache",
  });
  const meta = await res.json();

  return {
    title: `Syarat & Ketentuan - ${meta.site_name}`,
    description: `Syarat & Ketentuan penggunaan layanan ${meta.site_name}. Harap baca dengan seksama sebelum menggunakan layanan.`,
    robots: meta.meta_robots,
    keywords: meta.site_keywords,
    authors: [{ name: meta.site_author }],
  };
}

export default async function TermsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
    headers: { accept: "application/json" },
    cache: "force-cache",
  });

  const meta = await res.json();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 mt-40">
      <h1 className="text-3xl font-bold mb-6">Syarat & Ketentuan</h1>

      <p className="mb-4">
        Selamat datang di <strong>{meta.site_name}</strong>. Dengan mengakses dan menggunakan situs kami, Anda dianggap
        telah membaca, memahami, dan menyetujui semua syarat dan ketentuan yang berlaku.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Deskripsi Layanan</h2>
      <p className="mb-4">
        {meta.site_name} adalah platform streaming anime sub Indo lengkap dan terupdate. Anda dapat menonton anime
        favorit dengan subtitle Indonesia berkualitas HD kapan pun dan di mana pun.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Hak Cipta</h2>
      <p className="mb-4">
        Semua konten anime yang tersedia di {meta.site_name} merupakan milik pemilik hak cipta masing-masing.
        {meta.site_name} tidak menyimpan file video di server sendiri, melainkan menampilkan dari sumber pihak ketiga.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Tanggung Jawab Pengguna</h2>
      <p className="mb-4">
        Pengguna bertanggung jawab atas aktivitas yang dilakukan di situs ini. Jangan gunakan layanan kami untuk tujuan
        ilegal, pelanggaran hak cipta, atau aktivitas merugikan lainnya.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Perubahan</h2>
      <p className="mb-4">
        {meta.site_name} berhak mengubah syarat dan ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Anda
        disarankan untuk memeriksa halaman ini secara berkala.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Kontak</h2>
      <p className="mb-4">
        Jika ada pertanyaan atau masukan terkait syarat & ketentuan ini, silakan hubungi tim kami di bagian kontak atau
        melalui media sosial resmi.
      </p>

      <p className="text-sm text-gray-500 mt-10">
        &copy; {new Date().getFullYear()} {meta.site_name}. All rights reserved.
      </p>
    </main>
  );
}

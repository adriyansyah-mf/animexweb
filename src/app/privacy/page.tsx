import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
    headers: { accept: "application/json" },
    cache: "force-cache",
  });
  const meta = await res.json();

  return {
    title: `Kebijakan Privasi - ${meta.site_name}`,
    description: `Kebijakan Privasi situs ${meta.site_name}. Ketahui bagaimana data Anda dikumpulkan, digunakan, dan dilindungi.`,
    robots: meta.meta_robots,
    keywords: meta.site_keywords,
    authors: [{ name: meta.site_author }],
  };
}

export default async function PrivacyPolicyPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
    headers: { accept: "application/json" },
    cache: "force-cache",
  });

  const meta = await res.json();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 mt-40">
      <h1 className="text-3xl font-bold mb-6">Kebijakan Privasi</h1>

      <p className="mb-4">
        Privasi Anda penting bagi kami di <strong>{meta.site_name}</strong>. Dokumen ini menjelaskan bagaimana kami
        mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda saat menggunakan layanan kami.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Informasi yang Kami Kumpulkan</h2>
      <p className="mb-4">
        Kami dapat mengumpulkan informasi pribadi seperti alamat email, nama pengguna, dan preferensi tontonan. Informasi ini digunakan untuk meningkatkan pengalaman pengguna.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Penggunaan Informasi</h2>
      <p className="mb-4">
        Informasi yang dikumpulkan digunakan untuk analitik, peningkatan layanan, dan komunikasi terkait akun Anda.
        Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Keamanan Data</h2>
      <p className="mb-4">
        Kami menggunakan berbagai langkah keamanan untuk melindungi informasi pribadi Anda dari akses yang tidak sah,
        perubahan, atau pengungkapan.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Cookie</h2>
      <p className="mb-4">
        Situs kami menggunakan cookie untuk meningkatkan pengalaman pengguna. Anda dapat mengatur browser Anda untuk
        menolak cookie, namun beberapa fitur mungkin tidak berjalan optimal.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Perubahan Kebijakan</h2>
      <p className="mb-4">
        Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan akan diposting di halaman ini dan mulai berlaku segera setelah dipublikasikan.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Kontak</h2>
      <p className="mb-4">
        Jika Anda memiliki pertanyaan atau kekhawatiran tentang kebijakan privasi ini, silakan hubungi kami melalui halaman kontak atau media sosial resmi kami.
      </p>

      <p className="text-sm text-gray-500 mt-10">
        &copy; {new Date().getFullYear()} {meta.site_name}. All rights reserved.
      </p>
    </main>
  );
}

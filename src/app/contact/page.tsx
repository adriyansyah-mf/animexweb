import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  let meta = {
    site_name: "Otakustream",
    meta_robots: "index, follow",
    site_keywords: "anime, streaming, sub indo",
    site_author: "Otakustream Team",
  };

  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
        headers: { accept: "application/json" },
        cache: "force-cache",
      });
      
      if (res.ok) {
        meta = await res.json();
      }
    }
  } catch (error) {
    console.log("Using fallback metadata for contact page");
  }

  return {
    title: `Kontak - ${meta.site_name}`,
    description: `Hubungi tim ${meta.site_name} untuk pertanyaan, saran, atau kerja sama.`,
    robots: meta.meta_robots,
    keywords: meta.site_keywords,
    authors: [{ name: meta.site_author }],
  };
}

export default async function ContactPage() {
  let meta = {
    site_name: "Otakustream",
  };

  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
        headers: { accept: "application/json" },
        cache: "force-cache",
      });
      
      if (res.ok) {
        meta = await res.json();
      }
    }
  } catch (error) {
    console.log("Using fallback data for contact page");
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 mt-40">
      <h1 className="text-3xl font-bold mb-6">Kontak Kami</h1>

      <p className="mb-4">
        Terima kasih telah mengunjungi <strong>{meta.site_name}</strong>. Jika Anda memiliki pertanyaan, masukan, atau
        ingin bekerja sama, jangan ragu untuk menghubungi kami melalui informasi di bawah ini.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Alamat Email</h2>
      <p className="mb-4">
        Anda dapat menghubungi kami melalui email di{" "}
        <a href="mailto:admin@otakustream.xyz" className="text-blue-500 underline">
          admin@otakustream.xyz
        </a>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Media Sosial</h2>
      <p className="mb-4">
        Ikuti kami di media sosial resmi untuk update terbaru, pengumuman, dan interaksi komunitas.
      </p>

      <ul className="list-disc pl-6 mb-6">
        <li>
          Instagram:{" "}
          <a href="https://instagram.com/otakustream" className="text-blue-500 underline" target="_blank">
            @otakustream
          </a>
        </li>
        <li>
          Twitter:{" "}
          <a href="https://twitter.com/otakustream" className="text-blue-500 underline" target="_blank">
            @otakustream
          </a>
        </li>
        <li>
          Facebook:{" "}
          <a href="https://www.facebook.com/profile.php?id=61575256271867" className="text-blue-500 underline" target="_blank">
            @otakustream
          </a>
        </li>
      </ul>

      <p className="text-sm text-gray-500 mt-10">
        &copy; {new Date().getFullYear()} {meta.site_name}. All rights reserved.
      </p>
    </main>
  );
}

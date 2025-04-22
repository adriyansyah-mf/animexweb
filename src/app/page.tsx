import { Metadata } from 'next';
import Image from 'next/image';
import Head from 'next/head'; // Import Head from next/head

export async function generateMetadata(): Promise<Metadata> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
    next: { revalidate: 3600 }, // optional cache
  });

  const data = await res.json();

  return {
    title: data.meta_title,
    description: data.meta_description,
    keywords: data.site_keywords,
    authors: [{ name: data.site_author }],
    robots: data.meta_robots,
    openGraph: {
      title: data.meta_title,
      description: data.meta_description,
      siteName: data.site_name,
    },
  };
}

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Head>
        {/* Google Analytics (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-JSC21PRNYD"
        ></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-JSC21PRNYD');
            `,
          }}
        ></script>
      </Head>
      
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {/* Konten Halaman */}
      </main>
    </div>
  );
}

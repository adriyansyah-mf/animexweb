"use client";

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 relative">

      <div className="relative mb-6 flex flex-col items-center">
        <Image
          src="https://i.pinimg.com/736x/3f/69/68/3f69686c325206880879139a3e7fbc75.jpg"
          alt="404 Anime Girl"
          width={180}
          height={180}
          className="mb-2 animate-float rounded-xl shadow-lg"
          priority
        />

      </div>
      <h1 className="text-5xl font-extrabold mb-2 text-pink-400 drop-shadow-lg">404</h1>
      <h2 className="text-2xl font-bold mb-4">Halaman Tidak Ditemukan</h2>
      <p className="mb-2 text-center max-w-md text-lg text-gray-300">
        Waduh, jalannya salah! Sepertinya kamu nyasar ke dunia isekai.<br />
        <span className="text-pink-300">Kembali ke dunia OtakuStream yuk~</span>
      </p>
      <div className="mb-6 text-center text-base text-pink-200">
        <span className="text-2xl">🌸</span> <span className="font-semibold">迷子になっちゃった？</span> <span className="italic">(Maigo ni nacchatta?)</span><br />
        <span className="text-sm text-gray-300">Kamu tersesat, ya?</span><br />
        <span className="text-xs text-pink-300">"Ganbatte!" (がんばって) — Semangat, jangan menyerah mencari anime favoritmu!</span>
      </div>
      <Link href="/" className="inline-block bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200">
        ⬅️ Balik ke Beranda
      </Link>
      <div className="mt-8 text-sm text-gray-400">Powered by OtakuStream • Tetap semangat nonton anime!</div>
    </div>
  );
} 
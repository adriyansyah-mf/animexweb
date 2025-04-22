import { Separator } from "@/components/ui/separator";

export default function Footer({ siteName }: { siteName: string }) {
  return (
    <footer className="w-full mt-16 bg-background text-muted-foreground text-sm">
      <Separator />
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-2">
        <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
}

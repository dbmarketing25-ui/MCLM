import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { isOwner } from "@/lib/owner";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const owner = await isOwner();
  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="bg-lines pointer-events-none fixed inset-0 z-0 mx-auto max-w-[1240px]" />
      <Header isOwner={owner} />
      <main className="relative z-10">{children}</main>
      <div className="relative z-10">
        <Footer isOwner={owner} />
      </div>
    </div>
  );
}

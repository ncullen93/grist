import { Outlet } from "react-router";
import { Navbar } from "~/components/navbar";
import { Footer } from "~/components/footer";

export default function MarketingLayout() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar />
      <main className="pt-19">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

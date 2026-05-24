import MainBanner from "@/components/MainBanner";
import Categories from "@/components/Categories";
import BestSeller from "@/components/BestSeller";
import BottomBanner from "@/components/BottomBanner";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

export default function HomePage() {
  return (
    <main>
      <MainBanner />
      <Categories />
      <BestSeller />
      <BottomBanner />
      <NewsletterSubscribe />
    </main>
  );
}

import HeroBanner from "./components/HeroBanner";
import FeaturedProduct from "./components/FeaturedProduct";
import NewArrivals from "./components/NewArrivals";
import PromoSection1 from "./components/PromoSection1";
import PromoSection2 from "./components/PromoSection2";
import Gallery from "./components/Gallery";

const page = () => {
  return (
    <div className="min-h-screen">
      <HeroBanner />
      <PromoSection2 />
      <NewArrivals />
      <FeaturedProduct />
      <PromoSection1 />
      <Gallery />
    </div>
  );
}

export default page;
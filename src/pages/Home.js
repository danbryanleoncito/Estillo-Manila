import AppCarousel from "../components/AppCarousel";
import Products from "./Products";
import SiteDescription from "../components/SiteDescription";

export default function Home() {
  return (
    <>
      <AppCarousel />
      <Products />
      <SiteDescription />
    </>
  );
}

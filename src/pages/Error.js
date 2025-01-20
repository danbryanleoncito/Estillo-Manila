import Banner from "../components/Banner";

export default function Error() {
  const errorData = {
    title: "404 - Not Found",
    content: "We can't found your page",
    destination: "/",
    buttonLabel: "Go Back",
  };

  return <Banner data={errorData} />;
}

import { useEffect, useState } from "react";
import HowItWorks from "../components/HowItWorks";
import PetCard from "../../Components/PetCard";
import LandingPage from "../components/LandingPage";
import {getLatestPosts} from "../services/postService"
export default function Home() {

  const [latestPosts, setLatestPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLatestPosts() {
            try {
                const data = await getLatestPosts();
                setLatestPosts(data.latestPost);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchLatestPosts();
    }, []);


  return (
    <main className="min-h-screen bg-cream">
      
      <LandingPage/>

        <HowItWorks/>


        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
  <div className="flex justify-between items-center mb-10">
    <div>
      <h2 className="font-display text-4xl text-bark-dark">Latest Pets</h2>
      <p className="text-text-mid mt-1">
        Recently posted pets looking for a forever home.
      </p>
    </div>
  </div>

  {loading ? (
    <p className="text-center text-text-light py-10">Loading pets...</p>
  ) : latestPosts.length === 0 ? (
    <p className="text-center text-text-light py-10">No pets posted yet.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {latestPosts.map((post, i) => (
        <div
          key={post._id}
          className="animate-slide-down"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
        >
          <PetCard post={post} />
        </div>
      ))}
    </div>
  )}
</section>
    </main>
  );
}
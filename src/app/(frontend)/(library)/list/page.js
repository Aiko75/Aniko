import { Suspense } from "react";
import AnimeList from "@/components/pages/AnimeList";

export default function ListPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading list...</div>}
    >
      <AnimeList />
    </Suspense>
  );
}

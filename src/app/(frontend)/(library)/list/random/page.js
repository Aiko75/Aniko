import { Suspense } from "react";
import Random from "@/components/pages/RandomAnime";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading random...</div>}
    >
      <Random />
    </Suspense>
  );
}

import { useState } from "react";
import { PostAnalyzer } from "./PostAnalyzer";
import { ContentNudges } from "./ContentNudges";
import type { Seller } from "@/lib/mock-data";

export function MarketingHub({ seller }: { seller: Seller }) {
  const [_] = useState(0);
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-semibold">Marketing Hub</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Coach your posts and turn upcoming markets into content, {seller.name.split(" ")[0]}.
        </p>
      </div>
      <PostAnalyzer />
      <ContentNudges />
    </div>
  );
}

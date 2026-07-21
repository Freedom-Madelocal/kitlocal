import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MadeLocal — Seller Command Center" },
      {
        name: "description",
        content:
          "One place for local food producers to analyze social posts, plan markets, and track true profit.",
      },
      { property: "og:title", content: "MadeLocal — Seller Command Center" },
      {
        property: "og:description",
        content:
          "Marketing coach, market calendar, and profit tracker for bakers, farmers, and market vendors.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <AppShell />;
}

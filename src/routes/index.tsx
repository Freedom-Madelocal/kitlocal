import { createFileRoute, ClientOnly } from "@tanstack/react-router";
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
          "One place for local food producers to analyze social posts, plan markets, and track true profit.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen w-full bg-background grid place-items-center">
          <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      }
    >
      <AppShell />
    </ClientOnly>
  );
}


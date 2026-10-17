"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Project } from "@prisma/client";

export default function ProjectFilter({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get("project") || "";
  const dateRange = searchParams.get("range") || "7d";

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <select
        className="input w-48"
        value={projectFilter}
        onChange={(e) => {
          const url = new URL(window.location.href);
          if (e.target.value) url.searchParams.set("project", e.target.value);
          else url.searchParams.delete("project");
          router.push(url.pathname + url.search);
        }}
      >
        <option value="">All Projects</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <select
        className="input w-32"
        value={dateRange}
        onChange={(e) => {
          const url = new URL(window.location.href);
          url.searchParams.set("range", e.target.value);
          router.push(url.pathname + url.search);
        }}
      >
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
      </select>
    </div>
  );
}

import { DashboardHeader } from "@/components/dashboard/creator/dashboard-header";

export default function CreatorAnalyticsPage() {
  return (
    <>
      <DashboardHeader eyebrow="Performance insights" title="Analytics" />

      <div className="flex flex-col items-center justify-center gap-2 border border-[var(--dash-border)] bg-[var(--dash-surface)] px-6 py-20 text-center">
        <p className="text-sm font-medium text-[var(--dash-heading)]">
          This page is under construction.
        </p>
        <p className="max-w-md text-sm text-[var(--dash-muted)]">
          Creator analytics and performance tracking coming soon.
        </p>
      </div>
    </>
  );
}

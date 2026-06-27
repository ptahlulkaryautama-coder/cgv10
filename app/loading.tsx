import { PageShell } from "./components/portal";

export default function Loading() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="max-w-3xl">
          <div className="h-4 w-48 rounded-full bg-primary-soft" />
          <div className="mt-5 h-12 w-full max-w-2xl rounded-2xl bg-surface" />
          <div className="mt-3 h-12 w-3/4 rounded-2xl bg-surface" />
          <div className="mt-6 h-5 w-full max-w-xl rounded-full bg-surface" />
          <div className="mt-3 h-5 w-2/3 rounded-full bg-surface" />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

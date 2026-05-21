import { useMemo, useState } from "react";
import EmptyState from "../EmptyState";

export default function SavedRoutinesCard({ routines, loading, onAddRoutine }) {
  const [query, setQuery] = useState("");

  const filteredRoutines = useMemo(() => {
    if (!routines?.length) return [];
    return routines.filter((routine) =>
      routine.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, routines]);

  return (
    <div className="h-full flex flex-col rounded-2xl border border-white/60 bg-white/80 p-8 shadow-lg shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-950/40 dark:shadow-none">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-main">Saved Routines</h2>
            <p className="mt-2 text-sm text-muted">Your routines at a glance</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {routines?.length ?? 0}
          </span>
        </div>
        <div className="mt-5">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search routines…"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <p className="text-sm text-muted">Loading routines…</p>
        ) : filteredRoutines.length ? (
          <div className="space-y-4 overflow-hidden">
            {filteredRoutines.map((routine) => (
              <div
                key={routine._id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:border-primary/50 hover:shadow-md dark:border-slate-700 dark:bg-slate-950"
              >
                <p className="font-semibold text-main truncate">{routine.name}</p>
                <p className="mt-1 text-sm text-muted line-clamp-2">
                  {routine.description || "No routine description provided."}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <EmptyState type="routines" onAction={onAddRoutine} />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onAddRoutine}
        disabled={loading || !routines?.length}
        className="btn btn-primary w-full mt-4 cursor-pointer hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100"
      >
        + Add Routine
      </button>
    </div>
  );
}

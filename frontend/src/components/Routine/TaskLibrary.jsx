import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import EmptyState from "../EmptyState";

/* ---------------- Draggable Task Item ---------------- */
function DraggableTask({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task._id,
      data: {
        task,
      },
    });

  const style = {
    transform: isDragging
      ? undefined
      : transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    opacity: isDragging ? 0 : 1,
    position: "relative",
    zIndex: isDragging ? 99999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group flex items-center gap-3 rounded-xl border-soft bg-black/200 dark:bg-slate-800/80 p-3
                 cursor-grab active:cursor-grabbing
                 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition hover-lift"
      role="button"
      tabIndex={0}
      aria-label={`${task.title} - Drag to schedule or use arrow keys`}
    >
      {/* Color dot */}
      <span
        className="h-3 w-3 rounded-full"
        style={{
          backgroundColor:
            task.priority === "High"
              ? "#ef4444"
              : task.priority === "Medium"
                ? "#f59e0b"
                : "#10b981",
        }}
      />

      {/* Title */}
      <p className="flex-1 text-sm font-medium text-main truncate">
        {task.title}
      </p>
    </div>
  );
}

/* ---------------- Task Library ---------------- */
export default function TaskLibrary({ tasks, onAddTask }) {
  const [query, setQuery] = useState("");

  const filteredTasks = tasks?.filter((task) =>
    task.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col rounded-2xl border border-white/60 bg-white/80 p-8 shadow-lg shadow-slate-200/50 backdrop-blur-xl transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-950/40 dark:shadow-none animate-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-main">Task Library</h2>
            <p className="mt-2 text-sm text-muted">Drag tasks into your week</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {filteredTasks?.length ?? 0}
          </span>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search tasks…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />

      {/* Task List */}
      <div className="flex-1 space-y-3 pr-1">
        {filteredTasks?.length ? (
          filteredTasks.map((task) => (
            <DraggableTask key={task._id} task={task} />
          ))
        ) : (
          <EmptyState type="tasks" onAction={onAddTask} />
        )}
      </div>

      {/* Footer CTA */}
      <button
        type="button"
        className="btn btn-primary w-full mt-4 cursor-pointer hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:active:scale-100"
        onClick={onAddTask}
        disabled={!tasks?.length}
      >
        + Add Task
      </button>
    </div>
  );
}

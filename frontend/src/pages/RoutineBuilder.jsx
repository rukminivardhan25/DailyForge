import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import TaskLibrary from "../components/Routine/TaskLibrary";
import WeeklyGrid from "../components/Routine/WeeklyGrid";
import TaskFormModal from "../components/Task/TaskFormModal";
import SavedRoutinesCard from "../components/Routine/SavedRoutinesCard.jsx";
import useTasks from "../hooks/useTasks.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios.js";
import { useScrollThenOpen } from "../hooks/useScrollThenOpen.js";

export default function RoutineBuilder() {
  const { addTask, tasks } = useTasks();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [routineName, setRoutineName] = useState("");
  const [savedRoutines, setSavedRoutines] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [description, setDescription] = useState("");
  const [activeTask, setActiveTask] = useState(null);

  const normalizeDay = (day) => String(day || "").trim().toLowerCase();

  // Configure sensors for drag-and-drop (mouse + keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Modal open/close
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleOpenModal = useScrollThenOpen(openModal, 0);
  const handleAddRoutine = useScrollThenOpen(() => {}, 0);

  const handleSubmit = async (data) => {
    try {
      await addTask({ ...data, status: "Due" });
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to add task");
    }
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      setLoadingRoutines(true);
      const res = await api.get("/routines");
      setSavedRoutines(
        Array.isArray(res.data.routines) ? res.data.routines : []
      );
    } catch (err) {
      console.error(err);
      setSavedRoutines([]);
    } finally {
      setLoadingRoutines(false);
    }
  };

  const confirmSaveRoutine = async () => {
    const items = scheduledTasks
      .filter((task) => task.day === selectedDay)
      .map((task) => ({
        taskId: task.taskId,
        day: selectedDay,
        startTime: task.startTime,
        duration: task.duration,
      }));

    try {
      await api.post("/routines", {
        name: routineName,
        description,
        items,
      });

      setIsSaveModalOpen(false);
      setRoutineName("");
      setDescription("");
      setSelectedDay(null);
      alert("Routine saved successfully");
      await fetchRoutines();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to save routine";
      alert(errorMessage);
    }
  };

  const openSaveRoutineModal = (day) => {
    const hasTasks = scheduledTasks.some((t) => t.day === day);
    if (!hasTasks) {
      alert(`No tasks scheduled for ${day}`);
      return;
    }
    setSelectedDay(day);
    setRoutineName(`${day} Routine`);
    setIsSaveModalOpen(true);
  };

  /* ---------------- DRAG END HANDLER ---------------- */
  // Removing Schedule task after drag
  const removeScheduledTask = (taskId, day) => {

    //filtering out 
    setScheduledTasks((prev) =>
      prev.filter(
        (task) =>
          !(
            task.taskId === taskId &&
            normalizeDay(task.day) === normalizeDay(day)
          )
      )
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const task = active.data.current?.task;
    if (!task) return;
    const { day, startTime } = over.data.current;

    setScheduledTasks((prev) => [
      ...prev.filter((t) => !(t.taskId === task._id && t.day === day)),
      { taskId: task._id, title: task.title, day, startTime, duration: 60 },
    ]);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => setActiveTask(event.active.data.current?.task)}
      onDragEnd={(event) => {
        setActiveTask(null);
        handleDragEnd(event);
      }}
    >
      <div className="app-bg min-h-screen px-6 py-8 pb-40">

        {/* Header */}
        <header className="mb-8 flex items-start gap-4 animate-in delay-100">
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-1 rounded-lg p-2 border border-soft text-muted
                       hover:bg-white transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-main">
              Routine Builder
            </h1>
            <p className="mt-1 text-muted">Design your week</p>
          </div>
        </header>

        <section className="animate-in delay-200">
          <WeeklyGrid
            scheduledTasks={scheduledTasks}
            onSaveDay={openSaveRoutineModal}
            onDeleteTask={removeScheduledTask}
          />
        </section>

        <div className="grid gap-8 mt-8 animate-in delay-300 lg:grid-cols-[1fr_1.25fr]">
          <div className="h-full">
            <SavedRoutinesCard
              routines={savedRoutines}
              loading={loadingRoutines}
              onAddRoutine={handleAddRoutine}
            />
          </div>

          <div className="h-full">
            <TaskLibrary tasks={tasks} onAddTask={handleOpenModal} />
          </div>
        </div>

        {/* Task Form Modal */}
        {isModalOpen && (
          <TaskFormModal
            task={null}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        )}

        {/* Save Routine Modal */}
        {isSaveModalOpen && (
          <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in">
            <div className="card card-primary w-full max-w-md animate-in delay-100">
              <h3 className="text-lg font-semibold text-main mb-2">
                Save {selectedDay} Routine
              </h3>

              <input
                type="text"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="Routine name"
                className="w-full mb-4 rounded-xl border-soft px-3 py-2 text-sm
                           focus:outline-none bg-transparent text-main"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description (optional)"
                rows="3"
                className="w-full mb-4 rounded-lg border-soft px-3 py-2 text-sm
                           focus:ring-primary bg-transparent text-main resize-none"
              />

              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-muted"
                  onClick={() => setIsSaveModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary cursor-pointer"
                  onClick={confirmSaveRoutine}
                  disabled={!routineName.trim()}
                >
                  Save Routine
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="rounded-xl bg-white p-3 shadow-xl border border-gray-200">
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>

      </div>
    </DndContext>
  );
}
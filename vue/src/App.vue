<script setup>
import { ref, computed, nextTick } from "vue";
import { generateTasks } from "@/utils/data";

// shadcn-vue Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const tasks = ref([]);
const searchTerm = ref("");
const newTaskName = ref("");
const newTaskPriority = ref("Low");
const lastRenderTime = ref("0.00");

/**
 * Wrapper function to measure exactly how long Vue takes to update the DOM.
 * It captures the time before state mutation and calculates the difference
 * after nextTick() resolves (which happens after DOM flush).
 * @param {Function} updateFn - The function containing state mutations.
 */
const measureDOMUpdate = async (updateFn) => {
  const start = performance.now();
  updateFn();
  await nextTick();
  const end = performance.now();
  lastRenderTime.value = (end - start).toFixed(2);
};

/**
 * Generates and loads tasks.
 * @param {number} count - Number of tasks.
 */
const loadTasks = (count) => {
  measureDOMUpdate(() => {
    tasks.value = generateTasks(count);
  });
};

/**
 * Updates the first 50 tasks for benchmarking.
 */
const bulkUpdate50 = () => {
  measureDOMUpdate(() => {
    tasks.value = tasks.value.map((task, index) => {
      if (index < 50) {
        return { ...task, name: `${task.name} (Updated)`, priority: "High" };
      }
      return task;
    });
  });
};

/**
 * Deletes the first 50 tasks for benchmarking.
 */
const bulkDelete50 = () => {
  measureDOMUpdate(() => {
    tasks.value = tasks.value.slice(50);
  });
};

/**
 * Adds a single custom task.
 */
const addTask = () => {
  if (!newTaskName.value) return;
  measureDOMUpdate(() => {
    const newTask = {
      id: `task-custom-${Date.now()}`,
      name: newTaskName.value,
      priority: newTaskPriority.value,
    };
    tasks.value.unshift(newTask);
    newTaskName.value = "";
  });
};

/**
 * Removes a task by ID.
 * @param {string} id - Task identifier.
 */
const deleteTask = (id) => {
  measureDOMUpdate(() => {
    tasks.value = tasks.value.filter((t) => t.id !== id);
  });
};

/**
 * Cycles task priority.
 * @param {string} id - Task identifier.
 */
const togglePriority = (id) => {
  measureDOMUpdate(() => {
    const task = tasks.value.find((t) => t.id === id);
    if (task) {
      task.priority =
        task.priority === "Low"
          ? "Medium"
          : task.priority === "Medium"
            ? "High"
            : "Low";
    }
  });
};

/**
 * Computed property for search filtering.
 */
const filteredTasks = computed(() => {
  return tasks.value.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.value.toLowerCase()),
  );
});
</script>

<template>
  <div class="container mx-auto p-6 max-w-6xl space-y-8">
    <div class="p-4 bg-slate-100 rounded-lg border border-slate-200 space-y-4">
      <h2 class="text-xl font-bold">Benchmark Controls</h2>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" @click="loadTasks(100)"
          >Load 100 Tasks</Button
        >
        <Button variant="outline" @click="loadTasks(500)"
          >Load 500 Tasks</Button
        >
        <Button variant="outline" @click="loadTasks(1000)"
          >Load 1000 Tasks</Button
        >
        <Button
          variant="secondary"
          @click="bulkUpdate50"
          :disabled="tasks.length < 50"
          >Update 50 Tasks</Button
        >
        <Button
          variant="destructive"
          @click="bulkDelete50"
          :disabled="tasks.length < 50"
          >Delete 50 Tasks</Button
        >
        <Button
          variant="ghost"
          @click="() => measureDOMUpdate(() => (tasks = []))"
          >Clear</Button
        >
      </div>
      <div
        class="text-sm font-mono bg-white p-2 rounded shadow-sm inline-block"
      >
        Last DOM Render Time:
        <span class="text-blue-600 font-bold">{{ lastRenderTime }} ms</span>
        <span class="text-slate-400 ml-2"
          >| Total Nodes: {{ filteredTasks.length }}</span
        >
      </div>
    </div>

    <div
      class="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border"
    >
      <Input
        placeholder="Search tasks..."
        v-model="searchTerm"
        class="max-w-sm"
      />

      <div class="flex gap-2">
        <Input placeholder="New task name" v-model="newTaskName" class="w-48" />
        <Select v-model="newTaskPriority">
          <SelectTrigger class="w-28">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>
        <Button @click="addTask">Add Task</Button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div class="max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader class="sticky top-0 bg-slate-50 z-10">
            <TableRow>
              <TableHead>Task Name</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="filteredTasks.length === 0">
              <TableCell colspan="3" class="text-center py-8 text-slate-500">
                No tasks found. Use the benchmark controls to load data.
              </TableCell>
            </TableRow>
            <TableRow v-else v-for="task in filteredTasks" :key="task.id">
              <TableCell class="font-medium">{{ task.name }}</TableCell>
              <TableCell>
                <Badge
                  :variant="
                    task.priority === 'High'
                      ? 'destructive'
                      : task.priority === 'Medium'
                        ? 'default'
                        : 'secondary'
                  "
                >
                  {{ task.priority }}
                </Badge>
              </TableCell>
              <TableCell class="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  @click="togglePriority(task.id)"
                >
                  Change Priority
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  @click="deleteTask(task.id)"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>

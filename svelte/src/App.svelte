<script>
  // @ts-nocheck

  import { tick } from "svelte";
  import { generateTasks } from "@/utils/data";

  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";

  let tasks = $state([]);
  let searchTerm = $state("");
  let newTaskName = $state("");
  let newTaskPriority = $state("Low");
  let lastRenderTime = $state("0.00");

  let filteredTasks = $derived(
    tasks.filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  async function measureDOMUpdate(updateFn) {
    const start = performance.now();
    updateFn();
    await tick();
    const end = performance.now();
    lastRenderTime = (end - start).toFixed(2);
  }

  const loadTasks = (count) => {
    measureDOMUpdate(() => {
      tasks = generateTasks(count);
    });
  };

  const bulkUpdate50 = () => {
    measureDOMUpdate(() => {
      tasks = tasks.map((task, index) => {
        if (index < 50) {
          return { ...task, name: `${task.name} (Updated)`, priority: "High" };
        }
        return task;
      });
    });
  };

  const bulkDelete50 = () => {
    measureDOMUpdate(() => {
      tasks = tasks.slice(50);
    });
  };

  const addTask = () => {
    if (!newTaskName) return;
    measureDOMUpdate(() => {
      const newTask = {
        id: `task-custom-${Date.now()}`,
        name: newTaskName,
        priority: newTaskPriority,
      };
      tasks = [newTask, ...tasks];
      newTaskName = "";
    });
  };

  const deleteTask = (id) => {
    measureDOMUpdate(() => {
      tasks = tasks.filter((t) => t.id !== id);
    });
  };

  const togglePriority = (id) => {
    measureDOMUpdate(() => {
      tasks = tasks.map((t) => {
        if (t.id === id) {
          const nextPriority =
            t.priority === "Low"
              ? "Medium"
              : t.priority === "Medium"
                ? "High"
                : "Low";
          return { ...t, priority: nextPriority };
        }
        return t;
      });
    });
  };
</script>

<div class="container mx-auto p-6 max-w-6xl space-y-8">
  <div class="p-4 bg-slate-100 rounded-lg border border-slate-200 space-y-4">
    <h2 class="text-xl font-bold">Benchmark Controls</h2>
    <div class="flex flex-wrap gap-2">
      <Button
        type="button"
        class=""
        disabled={false}
        variant="outline"
        onclick={() => loadTasks(100)}>Load 100 Tasks</Button
      >
      <Button
        type="button"
        class=""
        disabled={false}
        variant="outline"
        onclick={() => loadTasks(500)}>Load 500 Tasks</Button
      >
      <Button
        type="button"
        class=""
        disabled={false}
        variant="outline"
        onclick={() => loadTasks(1000)}>Load 1000 Tasks</Button
      >
      <Button
        type="button"
        class=""
        disabled={tasks.length < 50}
        variant="secondary"
        onclick={bulkUpdate50}>Update 50 Tasks</Button
      >
      <Button
        type="button"
        class=""
        disabled={tasks.length < 50}
        variant="destructive"
        onclick={bulkDelete50}>Delete 50 Tasks</Button
      >
      <Button
        type="button"
        class=""
        disabled={false}
        variant="ghost"
        onclick={() => measureDOMUpdate(() => (tasks = []))}>Clear</Button
      >
    </div>
    <div class="text-sm font-mono bg-white p-2 rounded shadow-sm inline-block">
      Last DOM Render Time: <span class="text-blue-600 font-bold"
        >{lastRenderTime} ms</span
      >
      <span class="text-slate-400 ml-2"
        >| Total Nodes: {filteredTasks.length}</span
      >
    </div>
  </div>

  <div
    class="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border"
  >
    <Input
      type="text"
      placeholder="Search tasks..."
      bind:value={searchTerm}
      class="max-w-sm"
    />

    <div class="flex gap-2">
      <Input
        type="text"
        placeholder="New task name"
        bind:value={newTaskName}
        class="w-48"
      />
      <select
        bind:value={newTaskPriority}
        class="flex h-10 w-28 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <Button type="button" class="" disabled={false} onclick={addTask}
        >Add Task</Button
      >
    </div>
  </div>

  <div class="bg-white rounded-lg shadow-sm border overflow-hidden">
    <div class="max-h-[600px] overflow-y-auto">
      <Table class="">
        <TableHeader class="sticky top-0 bg-slate-50 z-10">
          <TableRow class="">
            <TableHead class="">Task Name</TableHead>
            <TableHead class="">Priority</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="">
          {#if filteredTasks.length === 0}
            <TableRow class="">
              <TableCell class="text-center py-8 text-slate-500" colspan={3}>
                No tasks found. Use the benchmark controls to load data.
              </TableCell>
            </TableRow>
          {:else}
            {#each filteredTasks as task (task.id)}
              <TableRow class="">
                <TableCell class="font-medium">{task.name}</TableCell>
                <TableCell class="">
                  <Badge
                    class=""
                    variant={task.priority === "High"
                      ? "destructive"
                      : task.priority === "Medium"
                        ? "default"
                        : "secondary"}
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell class="text-right space-x-2">
                  <Button
                    type="button"
                    class=""
                    disabled={false}
                    variant="outline"
                    size="sm"
                    onclick={() => togglePriority(task.id)}
                  >
                    Change Priority
                  </Button>
                  <Button
                    type="button"
                    class=""
                    disabled={false}
                    variant="destructive"
                    size="sm"
                    onclick={() => deleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            {/each}
          {/if}
        </TableBody>
      </Table>
    </div>
  </div>
</div>

import React, { useState, useMemo, Profiler, useRef } from 'react';
import { generateTasks } from './utils/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Main application component for benchmarking React DOM operations.
 * @returns {JSX.Element} The rendered React benchmark interface.
 */
function App() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Low');
  
  // FIXED: Replaced useState with useRef to prevent infinite render loops
  const timeDisplayRef = useRef(null);
  const renderCount = useRef(0);

  /**
   * Generates and loads a specific number of tasks into the application state.
   * @param {number} count - The number of tasks to load.
   */
  const loadTasks = (count) => {
    setTasks(generateTasks(count));
  };

  /**
   * Updates the name and priority of the first 50 tasks in the state to benchmark bulk DOM modifications.
   */
  const bulkUpdate50 = () => {
    setTasks((prev) => 
      prev.map((task, index) => {
        if (index < 50) {
          return { ...task, name: `${task.name} (Updated)`, priority: 'High' };
        }
        return task;
      })
    );
  };

  /**
   * Removes the first 50 tasks from the state to benchmark bulk DOM node deletions.
   */
  const bulkDelete50 = () => {
    setTasks((prev) => prev.slice(50));
  };

  /**
   * Appends a single new user-defined task to the top of the task list.
   */
  const addTask = () => {
    if (!newTaskName) return;
    const newTask = {
      id: `task-custom-${Date.now()}`,
      name: newTaskName,
      priority: newTaskPriority,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskName('');
  };

  /**
   * Removes a specific task from the state based on its unique identifier.
   * @param {string} id - The unique identifier of the task to remove.
   */
  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  /**
   * Cycles a task's priority sequentially through Low, Medium, and High.
   * @param {string} id - The unique identifier of the task to modify.
   */
  const togglePriority = (id) => {
    setTasks(tasks.map((t) => {
      if (t.id === id) {
        const nextPriority = t.priority === 'Low' ? 'Medium' : t.priority === 'Medium' ? 'High' : 'Low';
        return { ...t, priority: nextPriority };
      }
      return t;
    }));
  };

  /**
   * Computes a filtered array of tasks based on the current search term.
   * @type {Array<Object>}
   */
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tasks, searchTerm]);

  /**
   * React Profiler callback to capture the exact duration of DOM render cycles.
   * FIXED: Updates the DOM directly via ref instead of triggering a React state update.
   */
  const onRender = (id, phase, actualDuration) => {
    renderCount.current += 1;
    if (timeDisplayRef.current) {
      timeDisplayRef.current.textContent = actualDuration.toFixed(2);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      
      <div className="p-4 bg-slate-100 rounded-lg border border-slate-200 space-y-4">
        <h2 className="text-xl font-bold">Benchmark Controls</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => loadTasks(100)}>Load 100 Tasks</Button>
          <Button variant="outline" onClick={() => loadTasks(500)}>Load 500 Tasks</Button>
          <Button variant="outline" onClick={() => loadTasks(1000)}>Load 1000 Tasks</Button>
          <Button variant="secondary" onClick={bulkUpdate50} disabled={tasks.length < 50}>Update 50 Tasks</Button>
          <Button variant="destructive" onClick={bulkDelete50} disabled={tasks.length < 50}>Delete 50 Tasks</Button>
          <Button variant="ghost" onClick={() => setTasks([])}>Clear</Button>
        </div>
        <div className="text-sm font-mono bg-white p-2 rounded shadow-sm inline-block">
          {/* FIXED: Using a span with a ref to display the time */}
          Last DOM Render Time: <span className="text-blue-600 font-bold"><span ref={timeDisplayRef}>0.00</span> ms</span> 
          <span className="text-slate-400 ml-2">| Total Nodes: {filteredTasks.length}</span>
        </div>
      </div>

      <Profiler id="TodoList" onRender={onRender}>
        <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border">
          <Input 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          
          <div className="flex gap-2">
            <Input 
              placeholder="New task name" 
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="w-48"
            />
            <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addTask}>Add Task</Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 z-10">
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                      No tasks found. Use the benchmark controls to load data.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.name}</TableCell>
                      <TableCell>
                        <Badge variant={
                          task.priority === 'High' ? 'destructive' : 
                          task.priority === 'Medium' ? 'default' : 'secondary'
                        }>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => togglePriority(task.id)}>
                          Change Priority
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteTask(task.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Profiler>
    </div>
  );
}

export default App;
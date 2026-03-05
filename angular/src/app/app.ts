import { Component, signal, computed, afterNextRender, Injector, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { generateTasks, Task } from './utils/data';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Angular Signals for high-performance reactive state
  tasks = signal<Task[]>([]);
  searchTerm = signal('');
  newTaskName = signal('');
  newTaskPriority = signal('Low');

  lastRenderTime = signal('0.00');
  private injector = inject(Injector);

  /**
   * Computed signal to automatically filter tasks when the search term changes
   */
  filteredTasks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.tasks().filter(t => t.name.toLowerCase().includes(term));
  });

  /**
   * Benchmarking wrapper using Angular's afterNextRender
   */
  measureDOMUpdate(updateFn: () => void) {
    const start = performance.now();
    updateFn(); // Mutate the state

    // This hook resolves immediately after Angular flushes the DOM updates
    afterNextRender(() => {
      const end = performance.now();
      this.lastRenderTime.set((end - start).toFixed(2));
    }, { injector: this.injector });
  }

  loadTasks(count: number) {
    this.measureDOMUpdate(() => {
      this.tasks.set(generateTasks(count));
    });
  }

  bulkUpdate50() {
    this.measureDOMUpdate(() => {
      this.tasks.update(current =>
        current.map((task, index) => {
          if (index < 50) return { ...task, name: `${task.name} (Updated)`, priority: 'High' };
          return task;
        })
      );
    });
  }

  bulkDelete50() {
    this.measureDOMUpdate(() => {
      this.tasks.update(current => current.slice(50));
    });
  }

  addTask() {
    if (!this.newTaskName()) return;
    this.measureDOMUpdate(() => {
      const newTask: Task = {
        id: `task-custom-${Date.now()}`,
        name: this.newTaskName(),
        priority: this.newTaskPriority(),
      };
      this.tasks.update(current => [newTask, ...current]);
      this.newTaskName.set('');
    });
  }

  deleteTask(id: string) {
    this.measureDOMUpdate(() => {
      this.tasks.update(current => current.filter(t => t.id !== id));
    });
  }

  togglePriority(id: string) {
    this.measureDOMUpdate(() => {
      this.tasks.update(current =>
        current.map(t => {
          if (t.id === id) {
            const nextPriority = t.priority === 'Low' ? 'Medium' : t.priority === 'Medium' ? 'High' : 'Low';
            return { ...t, priority: nextPriority };
          }
          return t;
        })
      );
    });
  }
}
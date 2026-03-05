//function to create tasks
export interface Task {
    id: string;
    name: string;
    priority: string;
}

export const generateTasks = (count: number): Task[] => {
    const priorities = ['Low', 'Medium', 'High'];
    return Array.from({ length: count }, (_, i) => ({
        id: `task-${i + 1}-${Math.random().toString(36).substring(2, 9)}`,
        name: `Task Number ${i + 1}`,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
    }));
};
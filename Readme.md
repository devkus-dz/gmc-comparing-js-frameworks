# Frontend Framework DOM Performance Benchmark

This project is a comparative benchmark of modern JavaScript frameworks (React 19, Vue 3, Svelte 5, and Angular 21) focusing on DOM manipulation efficiency.

## 🎯 Objective
The goal is to analyze how different frameworks handle heavy DOM operations (rendering, updating, and deleting elements) by implementing a standardized To-Do List application.

## 🛠 Methodology
To ensure a strictly fair "apples-to-apples" comparison:
* **UI/CSS:** All frameworks render the exact same HTML node structure using Tailwind CSS v4.
* **Data:** A shared JSON generator dynamically creates identical datasets.
* **Measurement:** Performance is measured using browser-native APIs (`performance.now()` combined with framework-specific DOM flush hooks like `nextTick()`, `tick()`, and `afterNextRender()`) to capture true DOM paint times.

## 📊 Benchmark Results

| Operation | React 19 (ms) | Vue 3 (ms) | Svelte 5 (ms) | Angular 21 (ms) |
| :--- | :--- | :--- | :--- | :--- |
| **Initial Render (100 Tasks)** | [76.70] | [85.20] | [42.90] | [11.20] |
| **Initial Render (500 Tasks)** | [256.20] | [247.10] | [131.90] | [29.00] |
| **Initial Render (1000 Tasks)** | [405.40] | [514.00] | [239.00] | [60.60] |
| **Bulk Update (50 Tasks)** | [256.90] | [211.40] | [11.00] | [5.40] |
| **Bulk Delete (50 Tasks)** | [253.70] | [180.50] | [17.00] | [3.70] |
| **Add Single Task** | [242.40] | [182.50] | [7.30] | [4.00] |

## 📝 Reflection & Analysis

### 1. What challenges did you face in optimizing DOM operations for each framework?
The primary challenge was standardizing the performance measurement to ensure a fair, apples-to-apples comparison. Frameworks handle the DOM paint cycle differently. For instance, React’s built-in **<Profiler>** only measures the time taken to calculate Virtual DOM differences and commit them, but it doesn't wait for the browser to actually paint the screen. To solve this, I had to implement a unified benchmarking wrapper. For React, this meant combining **requestAnimationFrame** with a **setTimeout** to wait for the browser paint. For the others, I utilized their native DOM-flush hooks **(Vue's nextTick(), Svelte's tick(), and Angular's afterNextRender())** to ensure the timers stopped at the exact same point in the browser's rendering pipeline. Another challenge was strictly maintaining identical DOM node structures and CSS classes (via Tailwind v4) across vastly different component architectures to ensure the browser had the exact same rendering workload in every test.

### 2. How did each framework’s approach to DOM updates affect performance?
The data reveals a stark contrast between Virtual DOM frameworks (React, Vue) and fine-grained reactivity frameworks (Svelte, Angular).

- **React 19 & Vue 3:** Both rely on Virtual DOM diffing. When modifying 50 tasks or adding a single task to a 1000-item list, they took ~180ms to ~250ms. Because the state is held at the top of the list component, they must re-evaluate the entire 1000-item tree to figure out what changed before updating the DOM.

- **Svelte 5:** By using its new compiled Runes ($state), Svelte bypasses the Virtual DOM entirely. It compiles state changes into surgical vanilla JavaScript DOM updates. This resulted in massive performance gains for updates and deletions, dropping times down to 7ms - 17ms.

- **Angular 21:** Utilizing the new Signals architecture and the highly optimized @for control flow block, Angular completely bypasses its older Zone.js change detection. It surgically targeted the exact DOM nodes that required updates, resulting in the most efficient DOM manipulation across the board.

### 3. Which framework demonstrated the best performance in which scenarios, and why?
- **Initial Heavy Rendering:** Angular 21 was the clear winner, rendering 1000 complex DOM nodes in just 60.60ms, compared to Svelte (239ms), React (405.40ms), and Vue (514ms). Angular's new block control flow rendering engine is heavily optimized for fast DOM mounting.

- **Targeted Updates & Additions:** Both Angular and Svelte performed phenomenally here, operating in the sub-20ms range. For instance, adding a single task took Angular 4.00ms and Svelte 7.30ms, while React took a sluggish 242.40ms. This proves that for dynamic, data-heavy applications where individual rows update frequently, signal-based and compiled approaches (Angular/Svelte) vastly outperform Virtual DOM reconciliation (React/Vue).

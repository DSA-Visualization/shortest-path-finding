// Dijkstra Algorithm Implementation
function dijkstra(grid, start, end) {
    const rows = 20;
    const cols = 20;

    // Helper function to calculate the Manhattan distance between two cells
    function manhattanDistance(cellA, cellB) {
        const x1 = parseInt(cellA.dataset.row);
        const y1 = parseInt(cellA.dataset.col);
        const x2 = parseInt(cellB.dataset.row);
        const y2 = parseInt(cellB.dataset.col);
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }

    // Initialize the distance node arrays
    const distance = Array.from({ length: rows }, () => Array(cols).fill(Infinity));

    // Convert the grid into a 2D array
    const gridArray = [];
    for (let i = 0; i < rows; i++) {
        const row = grid.slice(i * cols, (i + 1) * cols);
        gridArray.push(row);
    }

    // Define the neighbors for cell exploration (up, down, left, right)
    const neighbors = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    // Initialize the starting cell
    const startX = parseInt(start.dataset.row);
    const startY = parseInt(start.dataset.col);
    distance[startX][startY] = 0;

    // Create a priority queue (min heap) for cell exploration
    const queue = [];
    queue.push({ cell: start, dist: 0 });

    while (queue.length) {
        // Get the cell with the shortest distance from the queue
        queue.sort((a, b) => a.dist - b.dist);
        const { cell, dist } = queue.shift();

        if (cell === end) {
            // Reconstruct the shortest path
            const path = [];
            let current = end;
            while (current !== start) {
                path.unshift(current);
                const x = parseInt(current.dataset.row);
                const y = parseInt(current.dataset.col);
                current = gridArray[x][y].previous;
            }
            return path;
        }

        // Explore the neighbors of the current cell
        for (const [dx, dy] of neighbors) {
            const x = parseInt(cell.dataset.row) + dx;
            const y = parseInt(cell.dataset.col) + dy;
            if (x >= 0 && x < rows && y >= 0 && y < cols) {
                const neighbor = gridArray[x][y];
                if (!neighbor.classList.contains("obstacle-cell")) {
                    const newDist = distance[parseInt(cell.dataset.row)][parseInt(cell.dataset.col)] + 1;
                    if (newDist < distance[x][y]) {
                        distance[x][y] = newDist;
                        neighbor.previous = cell;
                        queue.push({ cell: neighbor, dist: newDist + manhattanDistance(neighbor, end) });
                    }
                }
            }
        }
    }

    // If no path is found, return an empty array
    return [];
}


document.addEventListener("DOMContentLoaded", () => {
    const gridContainer = document.getElementById("grid-container");
    const startButton = document.getElementById("start-button");
    const clearButton = document.getElementById("clear-button");

    let startCell = null;
    let endCell = null;
    let isDrawing = false;

    // Create the grid
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            const cell = document.createElement("div");
            cell.classList.add("grid-cell");
    
            // Set data attributes for row and column
            cell.setAttribute("data-row", i);
            cell.setAttribute("data-col", j);
    
            cell.addEventListener("mousedown", () => {
                isDrawing = true;
                if (!startCell) {
                    startCell = cell;
                    startCell.classList.add("start-cell");
                } else if (!endCell) {
                    endCell = cell;
                    endCell.classList.add("end-cell");
                } else {
                    cell.classList.toggle("obstacle-cell");
                }
            });
            cell.addEventListener("mouseup", () => {
                isDrawing = false;
            });
            cell.addEventListener("mouseenter", () => {
                if (isDrawing) {
                    cell.classList.toggle("obstacle-cell");
                }
            });
            gridContainer.appendChild(cell);
        }
    }
    const bike = document.createElement("div");
    function moveBikeAlongPath(path) {
        bike.classList.add("bike");
        gridContainer.appendChild(bike);
    
        function moveStep(index) {
            if (index < path.length) {
                const cell = path[index];
                const x = cell.offsetLeft + cell.offsetWidth / 2 - bike.offsetWidth / 2;
                const y = cell.offsetTop + cell.offsetHeight / 2 - bike.offsetHeight / 2;
    
                bike.style.left = x + "px";
                bike.style.top = y + "px";
    
                bike.classList.add("animate");
    
                setTimeout(() => {
                    bike.classList.remove("animate");
                    moveStep(index + 1);
                }, 400); // Adjust the timeout to match the animation duration
            }
        }
    
        moveStep(0);
    }

    // Event listener for starting the pathfinding algorithm
    startButton.addEventListener("click", () => {
        const grid = Array.from(document.querySelectorAll(".grid-cell"));
        for (const cell of grid) {
            cell.classList.remove("shortest-path-cell");
        }
        const shortestPath = dijkstra(grid, startCell, endCell);
        if (shortestPath.length > 0) {
            for (const cell of shortestPath) {
                if (!cell.classList.contains("start-cell") && !cell.classList.contains("end-cell")) {
                    cell.classList.add("shortest-path-cell");
                }
            }
        moveBikeAlongPath(shortestPath);
        }else{
            alert('Path not found');
        }
    });

    // Event listener for clearing the path
    clearButton.addEventListener("click", () => {
        const grid = Array.from(document.querySelectorAll(".grid-cell"));
        for (const cell of grid) {
            cell.classList.remove("shortest-path-cell", "obstacle-cell", "start-cell", "end-cell","bike");
        }
        startCell = null;
        endCell = null;
        bike.remove();
    });
});




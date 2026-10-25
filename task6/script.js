// константы
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 20; // Размер одной клетки (20х20)
const GRID_SIZE = canvas.width / CELL_SIZE; // Количество клеток по сетке (400/20 = 20)
const MOVE_INTERVAL = 150; // Интервал движения змейки в миллисекундах

// состояние игры (Хранится отдельно от отрисовки) ---
let snake = [];
let direction = { x: 1, y: 0 }; // Текущее направление (изначально вправо)
let nextDirection = { x: 1, y: 0 }; // Буфер для нажатия клавиш
let apple = { x: 0, y: 0 };
let score = 0;
let gameOver = false;
let lastMoveTime = 0;

// элементы интерфейса
const scoreElement = document.getElementById('scoreValue');
const finalScoreElement = document.getElementById('finalScoreValue');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartBtn = document.getElementById('restartBtn');

// инициалзация и сброс
function resetGame() {
    // Змейка состоит из 3 сегментов изначально
    snake = [
        { x: 5, y: 10 }, // Голова
        { x: 4, y: 10 },
        { x: 3, y: 10 }  // Хвост
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    
    scoreElement.textContent = score;
    gameOverScreen.classList.add('hidden');
    
    spawnApple();
    
    // Сбрасываем таймер, чтобы змейка не делала рывок при старте
    lastMoveTime = performance.now();
}

// спавн яблок
function spawnApple() {
    let newApple;
    let isOccupied;

    // Ищем свободную клетку
    do {
        isOccupied = false;
        newApple = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };

        // Проверяем, не занята ли клетка змейкой
        for (let segment of snake) {
            if (segment.x === newApple.x && segment.y === newApple.y) {
                isOccupied = true;
                break;
            }
        }
    } while (isOccupied);

    apple = newApple;
}

// проверка коллизей
function checkCollision(head) {
    // 1. Столкновение со стеной
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }

    // 2. Столкновение с собственным хвостом
    // Если змейка не ест яблоко, хвост сдвинется, поэтому проверяем до предпоследнего сегмента
    const isEating = (head.x === apple.x && head.y === apple.y);
    const limit = isEating ? snake.length : snake.length - 1;

    for (let i = 0; i < limit; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }

    return false;
}

// движение змейки
function moveSnake() {
    direction = { ...nextDirection }; // Применяем накопленное направление
    
    const newHead = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    if (checkCollision(newHead)) {
        endGame();
        return;
    }

    snake.unshift(newHead); // Добавляем новую голову

    // Проверяем, съела ли змейка яблоко
    if (newHead.x === apple.x && newHead.y === apple.y) {
        score++;
        scoreElement.textContent = score;
        spawnApple();
        // Хвост не удаляем (змейка растет)
    } else {
        snake.pop(); // Удаляем хвост, если яблоко не съедено
    }
}

// обновление логики (вызывается по таймеру) 
function update() {
    if (!gameOver) {
        moveSnake();
    }
}

// отрисовка
function draw() {
    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем яблоко (круг красного цвета)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
        apple.x * CELL_SIZE + CELL_SIZE / 2, 
        apple.y * CELL_SIZE + CELL_SIZE / 2, 
        CELL_SIZE / 2 - 2, 
        0, 
        Math.PI * 2
    );
    ctx.fill();

    // Рисуем змейку (квадраты зеленого цвета)
    snake.forEach((segment, index) => {
        // Голова чуть светлее
        ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
        
        ctx.fillRect(
            segment.x * CELL_SIZE, 
            segment.y * CELL_SIZE, 
            CELL_SIZE - 1, // -1 для визуального зазора сетки
            CELL_SIZE - 1
        );
    });
}

// игровой цикл (requestAnimationFrame + deltaTime) 
function gameLoop(currentTime) {
    if (!gameOver) {
        const deltaTime = currentTime - lastMoveTime;

        // Если прошло достаточно времени (например, 150мс) -> обновляем логику
        if (deltaTime >= MOVE_INTERVAL) {
            update();
            
            // Корректируем время, чтобы скорость была постоянной
            // (отнимаем остаток, чтобы не было накопления ошибки)
            lastMoveTime = currentTime - (deltaTime % MOVE_INTERVAL);
        }

        // Отрисовываем каждый кадр (независимо от движения)
        draw();
    }

    // Продолжаем цикл
    requestAnimationFrame(gameLoop);
}

// заверщение игры
function endGame() {
    gameOver = true;
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// обработка клавиатуры
function handleKeyDown(event) {
    // Предотвращаем прокрутку страницы стрелками
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }

    // Запрещаем разворот на 180 градусов
    // Проверяем текущее направление (direction), а не следующее (nextDirection)
    if (event.key === 'ArrowUp' && direction.y === 0) {
        nextDirection = { x: 0, y: -1 };
    } else if (event.key === 'ArrowDown' && direction.y === 0) {
        nextDirection = { x: 0, y: 1 };
    } else if (event.key === 'ArrowLeft' && direction.x === 0) {
        nextDirection = { x: -1, y: 0 };
    } else if (event.key === 'ArrowRight' && direction.x === 0) {
        nextDirection = { x: 1, y: 0 };
    }
}

// старт приложения
document.addEventListener('keydown', handleKeyDown);
restartBtn.addEventListener('click', resetGame);

// Запуск
resetGame();
requestAnimationFrame(gameLoop);

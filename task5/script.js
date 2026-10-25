//  Переменные состояния 
let sequence = [];         // Последовательность компьютера
let playerSequence = [];   // Ввод игрока
let level = 0;             // Текущий уровень
let isPlayingSequence = false; // Флаг: показывает ли сейчас комп последовательность
let isGameOver = false;    // Флаг: закончена ли игра

// Массив для хранения ID всех активных таймеров.
// Нужен для того, чтобы при рестарте убить все зависшие setTimeout.
let activeTimers = [];

//  DOM Элементы 
const startBtn = document.getElementById('start-btn');
const levelDisplay = document.getElementById('level-display');
const statusMessage = document.getElementById('status-message');
const buttons = document.querySelectorAll('.btn');
const board = document.querySelector('.board');

// Настройки времени 
const HIGHLIGHT_DURATION = 400; // Сколько горит кнопка
const PAUSE_DURATION = 200;     // Пауза между кнопками

// Аудио 
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(frequency, duration) {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    oscillator.stop(audioCtx.currentTime + duration);
}

const sounds = [261.63, 329.63, 392.00, 523.25]; // Ноты 

//  Вспомогательные функции 

// Функция паузы на основе Promise (для async/await)
function delay(ms) {
    return new Promise((resolve) => {
        const timerId = setTimeout(resolve, ms);
        activeTimers.push(timerId);
    });
}

// Функция подсветки кнопки
async function flashButton(index, isPlayerClick = false) {
    const button = buttons[index];
    button.classList.add('active');
    
    // Играем звук
    playSound(sounds[index], isPlayerClick ? 0.15 : HIGHLIGHT_DURATION / 1000);

    // Ждем время подсветки, затем убираем класс
    await delay(isPlayerClick ? 150 : HIGHLIGHT_DURATION);
    button.classList.remove('active');
}

// Очистка всех зависших таймеров
function clearAllTimers() {
    activeTimers.forEach(timerId => clearTimeout(timerId));
    activeTimers = [];
    
    // Принудительно убираем подсветку со всех кнопок, если они зависли
    buttons.forEach(btn => btn.classList.remove('active'));
}

//  Основная логика 

// 1. Старт игры
function startGame() {
    // Очищаем таймеры от прошлой игры 
    clearAllTimers();
    
    // Сброс состояний
    sequence = [];
    playerSequence = [];
    level = 0;
    isGameOver = false;
    isPlayingSequence = false;
    
    // Обновление UI
    levelDisplay.textContent = `Уровень: ${level}`;
    statusMessage.textContent = 'Следите за кнопками...';
    startBtn.disabled = true; // Блокируем кнопку Старт на время игры
    
    // Запускаем следующий раунд
    nextRound();
}

// 2. Подготовка нового раунда
async function nextRound() {
    level++;
    levelDisplay.textContent = `Уровень: ${level}`;
    playerSequence = []; // Очищаем ввод игрока для нового раунда
    
    // Генерируем новую кнопку и добавляем в последовательность
    const randomIndex = Math.floor(Math.random() * 4);
    sequence.push(randomIndex);
    
    statusMessage.textContent = 'Запоминайте...';
    await playSequence();
    
    // После того как последовательность проиграна, разрешаем ход игроку
    isPlayingSequence = false;
    statusMessage.textContent = 'Ваш ход!';
}

// 3. Воспроизведение последовательности (Async/Await + setTimeout)
async function playSequence() {
    isPlayingSequence = true;
    board.classList.add('blocked'); // Блокируем клики мыши на время показа
    
    // Небольшая пауза перед началом показа
    await delay(500);
    
    for (let i = 0; i < sequence.length; i++) {
        // Проверяем, не нажали ли рестарт, пока играл звук
        if (isGameOver) break; 
        
        await flashButton(sequence[i]);
        await delay(PAUSE_DURATION); // Пауза между кнопками
    }
    
    board.classList.remove('blocked'); // Разблокируем клики
}

// 4. Обработка клика игрока
async function handlePlayerClick(event) {
    // Если комп показывает последовательность, или игра окончена - игнорируем клик
    if (isPlayingSequence || isGameOver) return;
    
    const clickedIndex = parseInt(event.target.dataset.id);
    
    // Визуальный и звуковой отклик (короткий)
    flashButton(clickedIndex, true);
    
    playerSequence.push(clickedIndex);
    
    // Проверяем правильность текущего клика
    const currentStep = playerSequence.length - 1;
    
    if (playerSequence[currentStep] !== sequence[currentStep]) {
        gameOver();
        return;
    }
    
    // Если дошли до конца последовательности и не ошиблись
    if (playerSequence.length === sequence.length) {
        isPlayingSequence = true; // Блокируем клики, пока идет пауза
        statusMessage.textContent = 'Отлично! Следующий уровень...';
        await delay(1000);
        if (!isGameOver) {
            nextRound();
        }
    }
}

// 5. Конец игры
function gameOver() {
    isGameOver = true;
    isPlayingSequence = false; //  снять блокировку, чтобы работал рестарт
    
    // Звук ошибки
    playSound(100, 0.5); 
    
    statusMessage.textContent = `Вы дошли до уровня ${level}`;
    startBtn.disabled = false; // Разрешаем нажать старт заново
    board.classList.add('blocked');
}

//  Слушатели событий 
startBtn.addEventListener('click', startGame);

buttons.forEach(button => {
    button.addEventListener('click', handlePlayerClick);
});

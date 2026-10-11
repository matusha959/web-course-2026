
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ (Состояние игры)

let secretNumber = ''; // Загаданное число (храним как строку)
let attempts = 0;      // Счетчик попыток
let isGameOver = false; // Флаг окончания игры


// ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ DOM

const inputField = document.getElementById('guess-input');
const checkBtn = document.getElementById('check-btn');
const newGameBtn = document.getElementById('new-game-btn');
const errorMessage = document.getElementById('error-message');
const attemptsCount = document.getElementById('attempts-count');
const historyList = document.getElementById('history-list');
const gameStatus = document.getElementById('game-status');

// ФУНКЦИИ ЛОГИКИ ИГРЫ


/**
 * Генерирует случайное 4-значное число с уникальными цифрами.
 * Использую массив, чтобы удобно проверять уникальность и не потерять ведущий ноль.
 */
function generateSecretNumber() {
    const digits = [];
    
    // Крутим цикл, пока не наберем 4 уникальные цифры
    while (digits.length < 4) {
        // Генерируем случайную цифру от 0 до 9
        const randomDigit = Math.floor(Math.random() * 10);
        
        // Если такой цифры еще нет в массиве, добавляем её
        if (!digits.includes(randomDigit)) {
            digits.push(randomDigit);
        }
    }
    
    // Склеиваем массив в строку и возвращаем
    return digits.join('');
}

/**
 * Проверяет ввод пользователя.
 * Возвращает объект: { isValid: boolean, error: string }
 */
function validateInput(input) {
    // 1. Проверка на пустоту
    if (input.length === 0) {
        return { isValid: false, error: 'Введите число!' };
    }

    // 2. Проверка на длину (ровно 4 символа)
    if (input.length !== 4) {
        return { isValid: false, error: 'Нужно ввести ровно 4 цифры!' };
    }

    // 3. Проверка, что это только цифры (регулярка \d означает "любая цифра")
    if (!/^\d+$/.test(input)) {
        return { isValid: false, error: 'Можно вводить только цифры (без букв и символов)!' };
    }

    // 4. Проверка на уникальность цифр.
    // Создаем Set (множество) из символов строки. Если размер Set < 4, значит есть повторы.
    const uniqueDigits = new Set(input);
    if (uniqueDigits.size !== 4) {
        return { isValid: false, error: 'Цифры не должны повторяться!' };
    }

    // Если все проверки пройдены
    return { isValid: true, error: '' };
}

/**
 * Считает быков и коров.
 * Возвращает объект: { bulls: number, cows: number }
 */
function calculateBullsAndCows(secret, guess) {
    let bulls = 0;
    let cows = 0;

    // Проходим по каждой цифре в попытке
    for (let i = 0; i < 4; i++) {
        const guessDigit = guess[i];
        const secretDigit = secret[i];

        // Если цифра на своем месте — это бык
        if (guessDigit === secretDigit) {
            bulls++;
        } 
        // Если цифра есть в секретном числе, но не на этом месте — это корова
        else if (secret.includes(guessDigit)) {
            cows++;
        }
    }

    return { bulls, cows };
}

/**
 * Добавляет запись в историю ходов (рендерит в DOM)
 */
function addHistoryRecord(guess, bulls, cows) {
    // Создаем новый div для записи
    const record = document.createElement('div');
    record.className = 'history-item';

    // Формируем HTML внутри записи
    // Использую template literals для удобства
    record.innerHTML = `
        <span class="guess">${guess}</span>
        <span class="result">${bulls} бык(ов), ${cows} коров(ы)</span>
    `;

    // Добавляем запись в начало списка (чтобы новые были сверху)
    historyList.prepend(record);
}

/**
 * Основная функция обработки хода (нажатие кнопки "Проверить")
 */
function handleCheckGuess() {
    // Если игра уже закончена, ничего не делаем
    if (isGameOver) return;

    const userGuess = inputField.value.trim();

    // 1. Валидация
    const validation = validateInput(userGuess);
    if (!validation.isValid) {
        errorMessage.textContent = validation.error;
        return; // Прерываем функцию, если ввод неверный
    }

    // Очищаем сообщение об ошибке, если ввод прошел валидацию
    errorMessage.textContent = '';

    // 2. Увеличиваем счетчик попыток
    attempts++;
    attemptsCount.textContent = attempts;

    // 3. Считаем быков и коров
    const result = calculateBullsAndCows(secretNumber, userGuess);

    // 4. Добавляем запись в историю
    addHistoryRecord(userGuess, result.bulls, result.cows);

    // 5. Проверяем условие победы
    if (result.bulls === 4) {
        gameStatus.textContent = `🎉 Победа! Угадано за ${attempts} попыток!`;
        isGameOver = true;
        checkBtn.disabled = true; // Блокируем кнопку проверки
        inputField.disabled = true; // Блокируем поле ввода
    } else {
        // Если не угадали, очищаем поле и ставим фокус для следующего ввода
        inputField.value = '';
        inputField.focus();
    }
}

/**
 * Сбрасывает игру в начальное состояние (нажатие кнопки "Новая игра")
 */
function resetGame() {
    // Сбрасываем переменные состояния
    secretNumber = generateSecretNumber();
    attempts = 0;
    isGameOver = false;

    // Сбрасываем UI
    attemptsCount.textContent = '0';
    errorMessage.textContent = '';
    gameStatus.textContent = '';
    historyList.innerHTML = ''; // Полностью очищаем историю
    inputField.value = '';
    
    // Разблокируем элементы управления
    checkBtn.disabled = false;
    inputField.disabled = false;
    
    // Ставим фокус на поле ввода
    inputField.focus();

    // Для отладки можно вывести число в консоль, но по ТЗ этого не требуется.
    // console.log('Загадано:', secretNumber); 
}

// ==========================================
// НАВЕШИВАНИЕ СОБЫТИЙ (Event Listeners)
// ==========================================

// Клик по кнопке "Проверить"
checkBtn.addEventListener('click', handleCheckGuess);

// Клик по кнопке "Новая игра"
newGameBtn.addEventListener('click', resetGame);

// Обработка нажатия Enter в поле ввода (удобно для пользователя)
inputField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleCheckGuess();
    }
});


// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ

// При первой загрузке сразу запускаем новую игру
window.addEventListener('DOMContentLoaded', resetGame);

// (массив объектов)
let todos = [
    // Пример начальных данных 
    // { id: 1, text: "Сделать лабу", completed: false }
];
let nextId = 1; // Для уникальных ID
let currentFilter = 'all'; // Текущий фильтр: 'all', 'active', 'completed'

// 2. Получение DOM-элементов
const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('todo-list');
const counter = document.getElementById('counter');
const filterBtns = document.querySelectorAll('.filter-btn');

// 3. Функция рендеринга (перерисовывает список на основе массива и фильтра)
function render() {
    // Очищаем список
    list.innerHTML = '';

    // Фильтрация массива (используем метод filter)
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; // 'all'
    });

    // Отрисовка отфильтрованных задач (используем forEach)
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        
        // Чекбокс
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        // Обработчик события изменения чекбокса
        checkbox.addEventListener('change', () => toggleTodo(todo.id));

        // Текст задачи
        const span = document.createElement('span');
        span.textContent = todo.text;

        // Кнопка удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        // Обработчик события клика по кнопке удаления
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        // Сборка элемента списка
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);

        // Если задача выполнена, добавляем класс для зачеркивания
        if (todo.completed) {
            li.classList.add('completed');
        }

        list.appendChild(li);
    });

    // Обновление счетчика
    const total = todos.length;
    // Используем filter для подсчета выполненных
    const completedCount = todos.filter(t => t.completed).length;
    counter.textContent = `Всего: ${total}. Выполнено: ${completedCount}.`;
}

// 4. Добавление задачи
function addTodo() {
    const text = input.value.trim(); // Убираем пробелы по краям

    // Проверка на пустую строку
    if (text === '') {
        alert('Задача не может быть пустой!');
        return;
    }

    // Добавляем новую задачу в массив
    todos.push({
        id: nextId++,
        text: text,
        completed: false
    });

    // Очищаем поле ввода и перерисовываем
    input.value = '';
    render();
}

// 5. Удаление задачи
function deleteTodo(id) {
    // Используем filter, чтобы оставить все задачи, кроме удаляемой
    todos = todos.filter(todo => todo.id !== id);
    render();
}

// 6. Переключение статуса выполнения
function toggleTodo(id) {
    // Используем find для поиска нужной задачи
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed; // Инвертируем boolean
        render();
    }
}

// 7. Обработчики событий для добавления (кнопка и Enter)
addBtn.addEventListener('click', addTodo);
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 8. Обработчики событий для фильтров
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter; // 'all', 'active', 'completed'
        render();
    });
});

// 9. Первоначальный рендеринг при загрузке страницы
render();

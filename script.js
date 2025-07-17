// Имитация базы данных в localStorage
if (!localStorage.getItem('users')) {
    const defaultUsers = [
        { username: 'admin', password: 'admin', isAdmin: true },
        { username: 'user', password: 'user', isAdmin: false }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

if (!localStorage.getItem('systemStatus')) {
    const defaultStatus = {
        plumbing: { status: 'ok', text: 'Работает нормально' },
        electric: { status: 'warning', text: 'Требуется проверка' },
        equipment: { status: 'ok', text: 'Работает нормально' }
    };
    localStorage.setItem('systemStatus', JSON.stringify(defaultStatus));
}

if (!localStorage.getItem('requests')) {
    localStorage.setItem('requests', JSON.stringify([]));
}

// DOM элементы
const loginScreen = document.getElementById('login-screen');
const userScreen = document.getElementById('user-screen');
const adminScreen = document.getElementById('admin-screen');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const requestForm = document.getElementById('request-form');
const adminTabs = document.querySelectorAll('.admin-tab');
const tabContents = document.querySelectorAll('.admin-tab-content');
const updateStatusBtn = document.getElementById('update-status-btn');
const statusSelects = document.querySelectorAll('.status-select');
const addUserForm = document.getElementById('add-user-form');
const requestsList = document.getElementById('requests-list');
const usersList = document.getElementById('users-list');

// Текущий пользователь
let currentUser = null;

// Функции для работы с localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function getSystemStatus() {
    return JSON.parse(localStorage.getItem('systemStatus'));
}

function getRequests() {
    return JSON.parse(localStorage.getItem('requests')) || [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveSystemStatus(status) {
    localStorage.setItem('systemStatus', JSON.stringify(status));
}

function saveRequests(requests) {
    localStorage.setItem('requests', JSON.stringify(requests));
}

// Обновление статусов на странице пользователя
function updateStatusCards() {
    const status = getSystemStatus();
    
    ['plumbing', 'electric', 'equipment'].forEach(system => {
        const card = document.getElementById(system);
        if (card) {
            const indicator = card.querySelector('.status-indicator');
            const text = card.querySelector('.status-text');
            
            indicator.className = 'status-indicator ' + status[system].status;
            text.textContent = status[system].text;
        }
    });
}

// Обновление списка заявок в админке
function updateRequestsList() {
    const requests = getRequests();
    requestsList.innerHTML = '';
    
    requests.forEach((request, index) => {
        const requestItem = document.createElement('div');
        requestItem.className = 'request-item';
        
        let photoHtml = '';
        if (request.photo) {
            photoHtml = `<img src="${request.photo}" alt="Фотография проблемы" class="request-photo">`;
        }
        
        requestItem.innerHTML = `
            <p><strong>Пользователь:</strong> ${request.username}</p>
            <p class="request-type">${getRequestTypeText(request.type)}</p>
            <p><strong>Описание:</strong> ${request.description}</p>
            <p><strong>Дата:</strong> ${new Date(request.date).toLocaleString()}</p>
            ${photoHtml}
            <button class="btn delete-request" data-index="${index}">Закрыть заявку</button>
        `;
        
        requestsList.appendChild(requestItem);
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.delete-request').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const requests = getRequests();
            requests.splice(index, 1);
            saveRequests(requests);
            updateRequestsList();
        });
    });
}

// Обновление списка пользователей в админке
function updateUsersList() {
    const users = getUsers();
    usersList.innerHTML = '';
    
    users.forEach((user, index) => {
        if (user.username === currentUser.username) return; // Не показываем текущего пользователя
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        userItem.innerHTML = `
            <div>
                <p><strong>Логин:</strong> ${user.username}</p>
                <p><strong>Роль:</strong> ${user.isAdmin ? 'Администратор' : 'Пользователь'}</p>
            </div>
            <button class="delete-user" data-index="${index}">Удалить</button>
        `;
        
        usersList.appendChild(userItem);
    });
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const users = getUsers();
            users.splice(index, 1);
            saveUsers(users);
            updateUsersList();
        });
    });
}

// Вспомогательные функции
function getRequestTypeText(type) {
    const types = {
        plumbing: 'Сантехника',
        electric: 'Электрика',
        equipment: 'Оборудование',
        other: 'Другое'
    };
    return types[type] || type;
}

function showScreen(screen) {
    loginScreen.classList.add('hidden');
    userScreen.classList.add('hidden');
    adminScreen.classList.add('hidden');
    
    document.getElementById(screen).classList.remove('hidden');
}

function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        
        if (user.isAdmin) {
            // Заполняем статусы в админке
            const status = getSystemStatus();
            Object.entries(status).forEach(([system, data]) => {
                const select = document.querySelector(`.status-select[data-system="${system}"]`);
                if (select) {
                    select.value = data.status;
                }
            });
            
            updateRequestsList();
            updateUsersList();
            showScreen('admin-screen');
        } else {
            updateStatusCards();
            showScreen('user-screen');
        }
        
        return true;
    }
    
    return false;
}

// Обработчики событий
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (loginUser(username, password)) {
        // Успешный вход
    } else {
        alert('Неверный логин или пароль');
    }
});

logoutBtn.addEventListener('click', function() {
    currentUser = null;
    showScreen('login-screen');
    loginForm.reset();
});

adminLogoutBtn.addEventListener('click', function() {
    currentUser = null;
    showScreen('login-screen');
    loginForm.reset();
});

requestForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const type = document.getElementById('request-type').value;
    const description = document.getElementById('request-description').value;
    const photoInput = document.getElementById('request-photo');
    
    let photo = '';
    if (photoInput.files.length > 0) {
        const file = photoInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            photo = e.target.result;
            saveRequest(type, description, photo);
        };
        reader.readAsDataURL(file);
    } else {
        saveRequest(type, description, photo);
    }
});

function saveRequest(type, description, photo) {
    const requests = getRequests();
    
    requests.push({
        username: currentUser.username,
        type,
        description,
        photo,
        date: new Date().toISOString()
    });
    
    saveRequests(requests);
    
    if (currentUser.isAdmin) {
        updateRequestsList();
    } else {
        alert('Заявка отправлена');
        requestForm.reset();
    }
}

adminTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Убираем активный класс со всех вкладок и контента
        adminTabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Добавляем активный класс текущей вкладке и соответствующему контенту
        this.classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

updateStatusBtn.addEventListener('click', function() {
    const status = {};
    
    statusSelects.forEach(select => {
        const system = select.getAttribute('data-system');
        const statusTexts = {
            ok: 'Работает нормально',
            warning: 'Требуется проверка',
            error: 'Авария'
        };
        
        status[system] = {
            status: select.value,
            text: statusTexts[select.value] || ''
        };
    });
    
    saveSystemStatus(status);
    updateStatusCards();
    alert('Статусы обновлены');
});

addUserForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;
    const isAdmin = document.getElementById('new-user-admin').checked;
    
    const users = getUsers();
    
    // Проверяем, есть ли уже такой пользователь
    if (users.some(u => u.username === username)) {
        alert('Пользователь с таким именем уже существует');
        return;
    }
    
    users.push({
        username,
        password,
        isAdmin
    });
    
    saveUsers(users);
    addUserForm.reset();
    updateUsersList();
    alert('Пользователь добавлен');
});

// Инициализация - показываем экран логина
showScreen('login-screen');

document.addEventListener('DOMContentLoaded', () => {
    // === 1. Зберігання та відображення даних про ОС та браузер у localStorage ===

    const browserInfoDiv = document.getElementById('browser-info');

    function saveAndDisplayBrowserInfo() {
        const os = navigator.platform;
        const userAgent = navigator.userAgent;
        const browserName = getBrowserName(userAgent);

        const info = {
            os: os,
            browser: browserName,
            userAgent: userAgent
        };

        localStorage.setItem('browserInfo', JSON.stringify(info));

        displayBrowserInfo();
    }

    function getBrowserName(userAgent) {
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
        if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'Internet Explorer';
        return 'Unknown';
    }

    function displayBrowserInfo() {
        const storedInfo = localStorage.getItem('browserInfo');
        if (storedInfo) {
            const info = JSON.parse(storedInfo);
            browserInfoDiv.innerHTML = `
                <p><strong>Операційна система:</strong> ${info.os}</p>
                <p><strong>Браузер:</strong> ${info.browser}</p>
                <p><strong>User-Agent:</strong> ${info.userAgent}</p>
            `;
        } else {
            browserInfoDiv.innerHTML = '<p>Інформація про браузер не знайдена.</p>';
        }
    }

    saveAndDisplayBrowserInfo(); // Зберегти та відобразити при завантаженні


    // === 2. Відображення динамічного вмісту (коментарів) ===
    const commentsContainer = document.getElementById('comments-container');
    const variantNumber = 24; 

    async function fetchComments() {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${variantNumber}/comments`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const comments = await response.json();
            displayComments(comments);
        } catch (error) {
            console.error('Помилка при завантаженні коментарів:', error);
            commentsContainer.innerHTML = '<p>Не вдалося завантажити коментарі.</p>';
        }
    }

    function displayComments(comments) {
        commentsContainer.innerHTML = ''; // Очистити попередні коментарі
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p>Коментарів поки що немає.</p>';
            return;
        }
        comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');
            commentDiv.innerHTML = `
                <h4>${comment.name}</h4>
                <p>${comment.body}</p>
                <small>Email: ${comment.email}</small>
            `;
            commentsContainer.appendChild(commentDiv);
        });
    }

    fetchComments(); // Завантажити коментарі при завантаженні сторінки


    // === 3. Відправлення форми зворотнього зв'язку (модальне вікно) ===
    const feedbackModal = document.getElementById('feedbackModal');
    const closeButton = document.querySelector('.close-button');
    const feedbackForm = document.getElementById('feedbackForm');
    const formStatus = document.getElementById('formStatus');

    let modalTimeout;

    // Показати модальне вікно через 1 хвилину
    function showModalAfterDelay() {
        modalTimeout = setTimeout(() => {
            feedbackModal.style.display = 'flex'; // Використовуємо flex для центрування
        }, 60 * 1000); // 60 секунд
    }

    // Закрити модальне вікно
    closeButton.addEventListener('click', () => {
        feedbackModal.style.display = 'none';
        clearTimeout(modalTimeout); // Зупинити таймер, якщо користувач закрив вікно вручну
    });

    // Закрити модальне вікно, якщо користувач клікнув за його межами
    window.addEventListener('click', (event) => {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = 'none';
            clearTimeout(modalTimeout);
        }
    });

    // Обробка відправки форми Formspree
    feedbackForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Запобігти стандартній відправці форми
        const formData = new FormData(feedbackForm);
        formStatus.textContent = 'Відправлення...';

        try {
            const response = await fetch(feedbackForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formStatus.textContent = 'Повідомлення успішно відправлено! Дякуємо!';
                feedbackForm.reset(); // Очистити форму
                setTimeout(() => {
                    feedbackModal.style.display = 'none'; // Закрити модальне вікно через 3 секунди
                    formStatus.textContent = '';
                }, 3000);
            } else {
                const data = await response.json();
                if (Object.hasOwnProperty.call(data, 'errors')) {
                    formStatus.textContent = `Помилка: ${data["errors"].map(error => error["message"]).join(", ")}`;
                } else {
                    formStatus.textContent = 'Помилка відправлення форми. Спробуйте ще раз.';
                }
            }
        } catch (error) {
            console.error('Помилка відправлення форми:', error);
            formStatus.textContent = 'Помилка мережі. Спробуйте ще раз.';
        }
    });

    showModalAfterDelay(); // Запускаємо таймер для модального вікна

    // === 4. Перехід на нічний/денний режим ===
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    // Завантаження теми з localStorage
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
    }

    // Збереження теми в localStorage
    function saveTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    // Автоматичне перемикання теми за часом доби
    function autoSwitchTheme() {
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 7 && hour < 21) { // Денна тема з 07:00 до 21:00
            if (body.classList.contains('dark-mode')) {
                body.classList.remove('dark-mode');
                themeToggle.checked = false;
                saveTheme('light');
            }
        } else { // Нічна тема в інший час
            if (!body.classList.contains('dark-mode')) {
                body.classList.add('dark-mode');
                themeToggle.checked = true;
                saveTheme('dark');
            }
        }
    }

    // Обробник зміни перемикача
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.add('dark-mode');
            saveTheme('dark');
        } else {
            body.classList.remove('dark-mode');
            saveTheme('light');
        }
    });

    // Ініціалізація теми при завантаженні
    loadTheme();
    autoSwitchTheme(); // Автоматично встановлюємо тему при завантаженні

    // Перевіряємо та оновлюємо тему кожну годину (або частіше, якщо потрібно)
    setInterval(autoSwitchTheme, 60 * 60 * 1000); // Кожна година
});
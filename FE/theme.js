(function () {
    const STORAGE_KEY = 'smart-home-theme';
    const root = document.documentElement;

    function getStoredTheme() {
        return localStorage.getItem(STORAGE_KEY) || root.dataset.theme || 'dark';
    }

    function updateThemeButtons(theme) {
        document.querySelectorAll('.theme-toggle-button').forEach((button) => {
            const isLight = theme === 'light';
            const icon = button.querySelector('i');
            const text = button.querySelector('.theme-toggle-text');

            button.setAttribute('aria-pressed', String(isLight));
            button.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');

            if (icon) {
                icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
            }
            if (text) {
                text.textContent = isLight ? 'Dark Mode' : 'Light Mode';
            }
        });
    }

    function applyTheme(theme, shouldPersist = true) {
        root.dataset.theme = theme;
        if (shouldPersist) {
            localStorage.setItem(STORAGE_KEY, theme);
        }
        updateThemeButtons(theme);
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    }

    function toggleTheme() {
        applyTheme(getStoredTheme() === 'light' ? 'dark' : 'light');
    }

    document.addEventListener('DOMContentLoaded', () => {
        const initialTheme = getStoredTheme();
        applyTheme(initialTheme, false);

        document.querySelectorAll('.theme-toggle-button').forEach((button) => {
            button.addEventListener('click', toggleTheme);
        });
    });

    window.appTheme = {
        applyTheme,
        toggleTheme,
        getTheme: getStoredTheme,
    };
})();

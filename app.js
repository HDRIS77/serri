// ... (Rest of the file remains the same as before)

// Theme Toggle (updated to start with dark and adjust icon)
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.getElementById('theme-toggle').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

// Initialize with dark theme
document.addEventListener('DOMContentLoaded', () => {
    currentTheme = 'dark';
    document.documentElement.setAttribute('data-theme', 'dark');
    updateTexts();
});

// ... (Rest of the file remains the same)

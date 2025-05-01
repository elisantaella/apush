// Theme handling functions
function initTheme() {
    // Add theme toggle to the page if it doesn't exist
    if (!document.querySelector('.theme-switch-wrapper')) {
        // Create theme toggle elements
        const themeWrapper = document.createElement('div');
        themeWrapper.className = 'theme-switch-wrapper';
        
        const themeSwitch = document.createElement('label');
        themeSwitch.className = 'theme-switch';
        themeSwitch.htmlFor = 'theme-toggle';
        
        const themeInput = document.createElement('input');
        themeInput.type = 'checkbox';
        themeInput.id = 'theme-toggle';
        
        const themeSlider = document.createElement('div');
        themeSlider.className = 'slider round';
        
        const themeLabel = document.createElement('span');
        themeLabel.className = 'theme-label';
        themeLabel.textContent = 'Dark Mode';
        
        // Assemble the toggle
        themeSwitch.appendChild(themeInput);
        themeSwitch.appendChild(themeSlider);
        themeWrapper.appendChild(themeSwitch);
        themeWrapper.appendChild(themeLabel);
        
        // Add to container (after h1 element)
        const container = document.querySelector('.container');
        const h1 = container.querySelector('h1');
        
        if (h1) {
            h1.after(themeWrapper);
        } else {
            container.prepend(themeWrapper);
        }
        
        // Add event listener for theme toggle
        themeInput.addEventListener('change', function() {
            toggleTheme(this.checked);
        });
    }
    
    // Check if we're on mobile - default to dark mode
    const isMobile = window.innerWidth <= 768;
    
    // Get saved theme preference or use default based on device
    let currentTheme = localStorage.getItem('theme');
    
    // If no theme is set and on mobile, default to dark mode
    if (!currentTheme && isMobile) {
        currentTheme = 'dark';
        localStorage.setItem('theme', 'dark');
    } else if (!currentTheme) {
        currentTheme = 'light';
    }
    
    // Apply saved theme
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = true;
        }
    }
}

function toggleTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

// Apply theme on page load
document.addEventListener('DOMContentLoaded', initTheme);

// Check on resize as well (for orientation changes)
window.addEventListener('resize', function() {
    const isMobile = window.innerWidth <= 768;
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // If resizing to mobile and currently in light mode, switch to dark mode
    if (isMobile && currentTheme === 'light') {
        toggleTheme(true);
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.checked = true;
        }
    }
});
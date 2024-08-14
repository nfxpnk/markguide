document.addEventListener('DOMContentLoaded', () => {
    let theme = window.sessionStorage.getItem('markguide-theme') || 'light';
    const htmlTag = document.querySelector('html');
    const themeButton = document.getElementById('js-markguide-theme');
    console.log(themeButton);
    setTheme();

    themeButton.addEventListener('click', () => {
        theme = (theme === 'light') ? 'dark' : 'light';
        setTheme();
    });

    function setTheme() {
        htmlTag.removeAttribute('data-' + theme + '-theme');
        htmlTag.setAttribute('data-color-mode', theme);
        htmlTag.setAttribute('data-' + theme + '-theme', theme);
        window.sessionStorage.setItem('markguide-theme', theme);
    }
});

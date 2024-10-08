'use strict';

(function () {
    const container = document.getElementById('js-markguide-container');
    const aside = document.getElementById('js-markguide-aside');
    const main = document.getElementById('js-markguide-main');
    const resizer = document.getElementById('js-markguide-aside-resizer');
    const fullscreen = document.getElementById('js-markguide-fullscreen');
    const resizerOverlay = document.getElementById('js-markguide-aside-resizer-overlay');

    function resizeTo(width) {
        aside.style.width = width + 'px';
        main.style.marginLeft = width + 'px';
    }

    function changeSize(event) {
        if (event.pageX < 0) {
            return;
        }
        if (container.classList.contains('js-aside-panel-hidden')) {
            container.classList.remove('js-aside-panel-hidden');
        }
        resizerOverlay.classList.add('js-dragging');
        resizeTo(event.pageX);
    }

    function asideHide() {
        container.classList.add('js-aside-panel-hidden');
        window.sessionStorage.getItem('asideWidth')
        resizeTo(0);
    }

    function asideShow() {
        container.classList.remove('js-aside-panel-hidden');
        resizeTo(window.sessionStorage.getItem('asideWidth'));
    }

    function asideToggle(event) {
        event.preventDefault();
        if (container.classList.contains('js-aside-panel-hidden')) {
            asideShow();
        } else {
            asideHide();
        }
    }

    // Store aside state
    function populateStorage() {
        window.sessionStorage && window.sessionStorage.setItem('asideWidth', aside.offsetWidth);
    }

    function setAsideState() {
        if (!window.sessionStorage) {
            return;
        }
        const storedValue = window.sessionStorage.getItem('asideWidth');
        const asideWidth = storedValue === null ? '270' : storedValue;

        if (asideWidth < 10) {
            asideHide();
        }
    }

    setAsideState();

    // Add event listeners
    document.addEventListener('mousedown', function(event) {
        if (event.target === resizer) {
            document.addEventListener('mousemove', changeSize);
        }
    });
    document.addEventListener('mouseup', function() {
        document.removeEventListener('mousemove', changeSize);
        resizerOverlay.classList.remove('js-dragging');
    });
    resizer.addEventListener('dblclick', asideToggle);
    fullscreen.addEventListener('click', asideToggle);

    window.addEventListener('beforeunload', populateStorage);
}());

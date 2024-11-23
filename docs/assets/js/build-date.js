'use strict';

document.addEventListener('DOMContentLoaded', function () {
    (function () {
        function loadBuildDateScript() {
            const script = document.createElement('script');
            script.src = '/build-date.js'; // Path to the build-date.js file
            script.onload = () => {
                const buildDateElement = document.getElementById('build-date');
                buildDateElement.textContent = buildDateString;
            };

            script.onerror = () => {
                console.warn('Failed to load build-date.js');
            };

            document.body.appendChild(script);
        }

        // Load the script
        loadBuildDateScript();
    })();
});

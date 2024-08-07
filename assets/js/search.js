'use strict';

window.onload = function() {
    (function() {
        const asidePanel = document.getElementById('js-markguide-aside');
        const searchField = document.getElementById('js-markguide-search');
        const searchClearBtn = document.getElementById('js-markguide-search-clear');
        const links = document.querySelectorAll('.js-markguide-nav-ln');
        let timeoutId = null;
        const waitForSearch = 'js-searching';
        const hasResults = 'js-found';
        const isRelevant = 'js-relevant';

        function startSearch() {
            asidePanel.classList.add(waitForSearch);
        }

        function finishSearch() {
            asidePanel.classList.remove(waitForSearch);
        }

        function clearSearch() {
            asidePanel.classList.remove(hasResults);
            links.forEach(link => link.classList.remove(isRelevant));
            searchField.value = '';
            window.sessionStorage.setItem('searchTerm', '');
        }

        function search(event) {
            let searchFunc = debounce(() => {
                console.log('search');
                const term = event.target.value;
                window.sessionStorage.setItem('searchTerm', term);
                if (!term) {
                    clearSearch();
                }

                runSearch(term);
            }, 300);

            searchFunc();
        }

        function debounce(func, delay) {
            return () => {
                const args = arguments;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func(args);
                }, delay);
            };
        }

        function runSearch(term) {
            const lowerCaseTerm = term.toLowerCase();

            links.forEach(link => {
                if (link.getAttribute('href') === '') {
                    return;
                }

                const elementText = link.textContent.toLowerCase();

                if (term.length && elementText.includes(lowerCaseTerm)) {
                    asidePanel.classList.add(hasResults);
                    //links[0].focus();
                    link.classList.add(isRelevant);
                } else {
                    link.classList.remove(isRelevant);
                }
            });
        }

        searchField.addEventListener('keyup', search);
        searchField.addEventListener('focus', startSearch);
        searchField.addEventListener('blur', finishSearch);
        searchClearBtn.addEventListener('click', clearSearch);

        const storedValue = window.sessionStorage ? window.sessionStorage.getItem('searchTerm') : null;

        if (storedValue) {
            searchField.value = storedValue;
            runSearch(storedValue);
        }
    }());
};

'use strict';

document.addEventListener('DOMContentLoaded', function () {
    (function () {
        let end = null;
        const navigation = document.getElementById('js-markguide-navigation');
        const navigationContent = document.getElementById('js-markguide-aside-content');
        const savedState = JSON.parse(window.sessionStorage.getItem("navState")) || {};

        function menuCollapse(ev) {
            if (ev.target.classList.contains('_category')) {
                ev.preventDefault();

                const itemId = ev.target.getAttribute("id");

                if (ev.target.classList.contains('js-collapsed')) {
                    ev.target.classList.remove('js-collapsed');
                    savedState[itemId] = true;
                } else {
                    ev.target.classList.add('js-collapsed');
                    savedState[itemId] = false;
                }

                window.sessionStorage.setItem("navState", JSON.stringify(savedState));
            }
        }

        function findParent(element) {
            if (!element || end) {
                return false;
            }

            end = element.classList.contains('markguide-nav');

            if (element.classList.contains('markguide-nav__item_category')) {
                element.querySelector('._category').classList.remove('js-collapsed');
            }
            findParent(element.parentElement);
        }

        function highlightCurrentPage() {
            const location = window.location.href;
            const currentFile = location.split('/').pop().replace('.html', '');
            const linkCurrent = document.getElementById('nav-link-' + currentFile);
            if (!linkCurrent) {
                return;
            }
            linkCurrent.classList.add('js-current-page');
            findParent(linkCurrent);

            const storedValue = window.sessionStorage ? window.sessionStorage.getItem('navigationScroll') : null;

            if (storedValue === null) {
                const linkPosition = linkCurrent.getBoundingClientRect().top;
                navigationContent.scrollTo && navigationContent.scrollTo(0, linkPosition - (window.innerHeight / 2));
            } else {
                document.getElementById('js-markguide-aside-content').scrollTo(0, storedValue);
            }
        }

        function populateStorage() {
            window.sessionStorage.setItem('navigationScroll', navigationContent.scrollTop);
        }

        navigation.addEventListener('click', menuCollapse);

        window.addEventListener('beforeunload', populateStorage);

        document.addEventListener('MyEventFired', function(event) {
            const navItems = document.querySelectorAll(".markguide-nav__ln");

            navItems.forEach(item => {
                const itemId = item.getAttribute("id");

                if (savedState[itemId] == true) {
                    item.classList.remove("js-collapsed");
                }
            });

            highlightCurrentPage();
        });


    }());
});

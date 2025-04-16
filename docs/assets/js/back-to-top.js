document.addEventListener('DOMContentLoaded', () => {
    const scrollButton = document.getElementById('js-markguide-top');

    // Add click event listener to the button
    scrollButton.addEventListener('click', function() {
        // Scroll to the top of the page
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // This adds a smooth scrolling effect
        });
    });
});

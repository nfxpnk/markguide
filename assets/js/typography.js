document.addEventListener('DOMContentLoaded', function() {
    // Get all elements with class 'show-typography'
    const elements = document.querySelectorAll('.show-typography');

    elements.forEach(function(currentElement) {
        // Get computed styles
        const computedStyle = getComputedStyle(currentElement);
        const fontSize = computedStyle.fontSize;
        const lineHeight = computedStyle.lineHeight;
        const letterSpacing = computedStyle.letterSpacing;
        const fontFamily = computedStyle.fontFamily;
        const fontWeight = computedStyle.fontWeight;

        // Append font size and line height
        const span = document.createElement('span');
        span.textContent = fontSize + '/' + lineHeight;
        currentElement.appendChild(span);

        // Calculate letter-spacing in em and line-height in em
        const fontSizeValue = parseFloat(fontSize);
        const letterSpacingEm = (parseFloat(letterSpacing) / fontSizeValue).toFixed(2);
        const lineHeightEm = (parseFloat(lineHeight) / fontSizeValue).toFixed(2);

        // Create CSS content
        const cssContent =
            'font-family: ' + fontFamily + ';\n' +
            'font-size: ' + fontSize + '/' + lineHeight + ';\n' +
            'font-weight: ' + fontWeight + ';\n' +
            'line-height: ' + lineHeightEm + ';\n' +
            'letter-spacing: ' + letterSpacingEm + 'em (' + letterSpacing + ')' + ';\n';

        // Create <pre><code> element to display CSS
        const div = document.createElement('div');
        div.className = 'b-markguide-code';
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.className = 'language-css';
        code.textContent = cssContent;
        pre.appendChild(code);

        // Insert the <pre><code> after the current element
        currentElement.parentNode.insertBefore(pre, currentElement.nextSibling);
    });
});

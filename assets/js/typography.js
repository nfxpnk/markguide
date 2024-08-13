// Define constants for class names
const TYPOGRAPHY_CLASS = 'show-typography';
const CODE_CONTAINER_CLASS = 'b-markguide-code';
const CSS_LANGUAGE_CLASS = 'language-css';

document.addEventListener('DOMContentLoaded', () => {
    // Get all elements with class 'show-typography'
    const elements = document.querySelectorAll(`.${TYPOGRAPHY_CLASS}`);

    elements.forEach(element => {
        // Get computed styles
        const styles = getComputedStyle(element);
        const { fontSize, lineHeight, letterSpacing, fontFamily, fontWeight } = styles;

        appendTypographyInfo(element, fontSize, lineHeight);
        insertCSSInfo(element, { fontSize, lineHeight, letterSpacing, fontFamily, fontWeight });
    });
});

function appendTypographyInfo(element, fontSize, lineHeight) {
    // Append font size and line height
    const span = document.createElement('span');
    span.textContent = `${fontSize}/${lineHeight}`;
    element.appendChild(span);
}

function insertCSSInfo(element, styles) {
    const { fontSize, lineHeight, letterSpacing, fontFamily, fontWeight } = styles;
    const fontSizeValue = parseFloat(fontSize);

    // Calculate line-height in em
    const lineHeightEm = (parseFloat(lineHeight) / fontSizeValue).toFixed(2);

    // Calculate letter-spacing in em
    const letterSpacingEm = getLetterSpacingEm(letterSpacing, fontSizeValue);

    // Create CSS content
    const cssContent = `font-family: ${fontFamily};
font-size: ${fontSize}/${lineHeight};
font-weight: ${fontWeight};
line-height: ${lineHeightEm};
letter-spacing: ${letterSpacingEm};
`.trim();

    // Create and insert <pre><code> element to display CSS
    const pre = createCodeElement(cssContent);
    element.parentNode.insertBefore(pre, element.nextSibling);
}

function getLetterSpacingEm(letterSpacing, fontSizeValue) {
    if (letterSpacing === 'normal') {
        return 'normal';
    }
    const letterSpacingValue = parseFloat(letterSpacing);

    let letterSpacingReturnValue = '';

    if(isNaN(letterSpacingValue)) {
        letterSpacingReturnValue = 'normal';
    } else {
        letterSpacingReturnValue = `${(letterSpacingValue / fontSizeValue).toFixed(2)}em (${letterSpacing})`;
    }

    return letterSpacingReturnValue;
}

function createCodeElement(content) {
    const div = document.createElement('div');
    div.className = CODE_CONTAINER_CLASS;
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.className = CSS_LANGUAGE_CLASS;
    code.textContent = content;
    pre.appendChild(code);
    div.appendChild(pre);

    return div;
}

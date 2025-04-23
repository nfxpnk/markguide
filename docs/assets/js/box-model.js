document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll('.js-show-box-model').forEach(function(currentElement) {
        const padding = {};
        const margin = {};
        const paddingPos = { left: 'left', right: 'right', top: 'top', bottom: 'bottom' };
        const marginPos = { left: 'left', right: 'right', top: 'top', bottom: 'bottom' };

        const showSizes = currentElement.dataset.showSizes === "true";
        const addPadding = currentElement.dataset.addPadding === "true";

        ['left', 'right', 'top', 'bottom'].forEach(position => {
            padding[position] = window.getComputedStyle(currentElement).getPropertyValue('padding-' + position);
            margin[position] = window.getComputedStyle(currentElement).getPropertyValue('margin-' + position);
        });

        const paddingPosition = JSON.parse(currentElement.dataset.paddingPosition || '{}');
        if (paddingPosition) {
            Object.assign(paddingPos, {
                left: paddingPosition.l || paddingPos.left,
                right: paddingPosition.r || paddingPos.right,
                top: paddingPosition.t || paddingPos.top,
                bottom: paddingPosition.b || paddingPos.bottom
            });
        }

        const marginPosition = JSON.parse(currentElement.dataset.marginPosition || '{}');
        if (marginPosition) {
            Object.assign(marginPos, {
                left: marginPosition.l || marginPos.left,
                right: marginPosition.r || marginPos.right,
                top: marginPosition.t || marginPos.top,
                bottom: marginPosition.b || marginPos.bottom
            });
        }

        const showBoxModelParent = document.createElement('div');
        showBoxModelParent.className = 'show-box-model-parent';
        if (window.getComputedStyle(currentElement).display !== 'block' && window.getComputedStyle(currentElement).display !== 'flex') {
            showBoxModelParent.style.display = 'inline-block';
        }

        if (showSizes && addPadding) {
            ['left', 'right', 'top', 'bottom'].forEach(position => {
                if (parseFloat(padding[position]) > 0) {
                    showBoxModelParent.style['padding-' + paddingPos[position]] = '60px';
                }
                if (parseFloat(margin[position]) > 0) {
                    showBoxModelParent.style['padding-' + marginPos[position]] = '60px';
                }
            });
        }

        currentElement.parentNode.insertBefore(showBoxModelParent, currentElement);
        showBoxModelParent.appendChild(currentElement);

        const innerWrapper = document.createElement('div');
        innerWrapper.className = 'show-box-model-parent-in';
        currentElement.parentNode.insertBefore(innerWrapper, currentElement);
        innerWrapper.appendChild(currentElement);

        const highlightElement = document.createElement('div');
        highlightElement.className = 'highlight-element';
        currentElement.parentNode.insertBefore(highlightElement, currentElement.nextSibling);

        function appendBoxModelElement(className, cssProperties, value, position) {
            if (parseFloat(value) > 0) {
                const element = document.createElement('div');
                element.className = className;
                Object.keys(cssProperties).forEach(property => {
                    if (property.startsWith('--')) {
                        // CSS custom property
                        element.style.setProperty(property, cssProperties[property]);
                    } else {
                        element.style[property] = cssProperties[property];
                    }
                });
                if (showSizes) {
                    const valueSpan = document.createElement('span');
                    valueSpan.className = 'show-box-model-position-' + position;
                    valueSpan.textContent = value;
                    element.appendChild(valueSpan);
                }
                currentElement.parentNode.insertBefore(element, currentElement.nextSibling);
            }
        }

        appendBoxModelElement('padding-top', { left: margin.left, right: margin.right, top: margin.top, height: padding.top }, padding.top, paddingPos.top);
        appendBoxModelElement('padding-bottom', { left: margin.left, right: margin.right, bottom: margin.bottom, height: padding.bottom }, padding.bottom, paddingPos.bottom);
        appendBoxModelElement('padding-left', { left: margin.left, top: margin.top, bottom: margin.bottom, width: padding.left, '--mask-visible-height': padding.bottom }, padding.left, paddingPos.left);
        appendBoxModelElement('padding-right', { right: margin.right, top: margin.top, bottom: margin.bottom, width: padding.right, '--mask-visible-height': padding.bottom }, padding.right, paddingPos.right);

        appendBoxModelElement('margin-left', { left: '0', top: '0', width: margin.left, height: '100%', '--mask-visible-height': margin.bottom }, margin.left, marginPos.left);
        appendBoxModelElement('margin-right', { right: '0', top: '0', width: margin.right, height: '100%', '--mask-visible-height': margin.bottom }, margin.right, marginPos.right);
        appendBoxModelElement('margin-top', { top: '0', left: '0', width: '100%', height: margin.top }, margin.top, marginPos.top);
        appendBoxModelElement('margin-bottom', { bottom: '0', left: '0', width: '100%', height: margin.bottom }, margin.bottom, marginPos.bottom);
    });
});

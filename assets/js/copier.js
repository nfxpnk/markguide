'use strict';

class Copier {
    constructor(instance) {
        this.instance = instance;
        this.copyInput = this.instance.querySelector('.js-copier-text');
        this.copyButton = this.instance.querySelector('.js-copier-button') || this.instance;
        this.initListeners();
    }

    showMessage() {
        if (this.instance.querySelector('.b-markguide-markup__copy-message')) {
            return; // If the message is already there, don't add a new one
        }

        const message = 'Copied!';
        const messageBlock = document.createElement('div');
        messageBlock.className = 'b-markguide-markup__copy-message';
        messageBlock.textContent = message;
        this.copyButton.insertAdjacentElement('afterend', messageBlock);

        setTimeout(() => {
            messageBlock.style.opacity = '0';  // Fade out by reducing opacity
            // Remove the element after the fade-out transition is complete
            messageBlock.addEventListener('transitionend', () => {
                messageBlock.remove();
            });
        }, 1500);
    }

    copyText() {
        let syntheticInput;
        if (!['INPUT', 'TEXTAREA'].includes(this.copyInput.nodeName)) {
            syntheticInput = this.createSyntheticInput();
        }

        const targetInput = syntheticInput || this.copyInput;
        targetInput.select();

        try {
            document.execCommand('copy');
            this.showMessage();
        } catch (e) {
            console.error('Copy command failed', e);
        }

        if (syntheticInput) {
            syntheticInput.remove();
        }
    }

    createSyntheticInput() {
        const textarea = document.createElement('textarea');
        textarea.value = this.copyInput.textContent;
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        this.instance.appendChild(textarea);
        return textarea;
    }

    initListeners() {
        this.copyButton.addEventListener('click', () => this.copyText());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.js-copier').forEach(node => new Copier(node));
});

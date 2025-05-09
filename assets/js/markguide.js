'use strict';

(function() {
    var MarkguideStateGenerator;

    MarkguideStateGenerator = (function() {
        var pseudoSelectors = [
            'hover',
            'enabled',
            'disabled',
            'active',
            'visited',
            'focus',
            'target',
            'checked',
            'empty',
            'first-of-type',
            'last-of-type',
            'first-child',
            'last-child'
        ];

        var attributeSelectors = [
            'disabled',
            'readonly',
            'required',
            'checked',
            'selected'
        ];

        var pseudos = new RegExp("(\\:" + (pseudoSelectors.join('|\\:')) + ")", "g");

        var attributes = new RegExp("(\\[" + (attributeSelectors.join('\\]|\\[')) + "\\])", "g");

        function MarkguideStateGenerator() {
            var stylesheet;
            var _i;
            var _len;
            var _ref;

            try {
                _ref = document.styleSheets;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    stylesheet = _ref[_i];
                    if (stylesheet.href && stylesheet.href.indexOf(document.domain) >= 0) {
                        //console.log(stylesheet.href);
                        this.insertRules(stylesheet.cssRules);
                    }
                }
            } catch (_error) {
                console.log(_error);
            }
        }

        MarkguideStateGenerator.prototype.insertRules = function(rules) {
            //console.log('insertRules');
            let idx;
            for (idx = 0; idx < rules.length; idx++) {
                let rule = rules[idx];
                //console.log(rule.type);
                //console.log(pseudos.test(rule.selectorText), rule.selectorText);
                if (rule.type === CSSRule.MEDIA_RULE) {
                    //console.log('CSSRule.MEDIA_RULE');
                    this.insertRules(rule.cssRules);
                } else if ((rule.type === CSSRule.STYLE_RULE) && (pseudos.test(rule.selectorText) || attributes.test(rule.selectorText))) {
                    //console.log('CSSRule.STYLE_RULE');

                    let replaceRule = function(matched) {
                        return matched.replace(/:/g, '.pseudo-class-');
                    };

                    let replaceRule2 = function(matched) {
                        return matched.replace(/\[([^\]]+)\]/g, '.attribute-class-$1');
                    };

                    this.insertRule(rule.cssText.replace(pseudos, replaceRule));

                    this.insertRule(rule.cssText.replace(attributes, replaceRule2));
                }

                pseudos.lastIndex = 0;
                attributes.lastIndex = 0;
            }
        };

        MarkguideStateGenerator.prototype.insertRule = function(rule) {
            //console.log(rule);
            var headEl;
            var styleEl;
            headEl = document.getElementsByTagName('head')[0];
            styleEl = document.createElement('style');
            styleEl.type = 'text/css';
            if (styleEl.styleSheet) {
                styleEl.styleSheet.cssText = rule;
            } else {
                styleEl.appendChild(document.createTextNode(rule));
            }
            return headEl.appendChild(styleEl);
        };

        return MarkguideStateGenerator;
    })();

    new MarkguideStateGenerator();
}).call(this);

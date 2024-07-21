'use strict';

(function() {
    var AtlasStateGenerator;

    AtlasStateGenerator = (function() {
        var pseudoSelectors;
        pseudoSelectors = [
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

        var pseudos = new RegExp("(\\:" + (pseudoSelectors.join('|\\:')) + ")", "g");

        function AtlasStateGenerator() {
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

        AtlasStateGenerator.prototype.insertRules = function(rules) {
            //console.log('insertRules');
            let idx;
            for (idx = 0; idx < rules.length; idx++) {
                let rule = rules[idx];
                //console.log(rule.type);
                //console.log(pseudos.test(rule.selectorText), rule.selectorText);
                if (rule.type === CSSRule.MEDIA_RULE) {
                    //console.log('CSSRule.MEDIA_RULE');
                    this.insertRules(rule.cssRules);
                } else if ((rule.type === CSSRule.STYLE_RULE) && pseudos.test(rule.selectorText)) {
                    //console.log('CSSRule.STYLE_RULE');

                    let replaceRule = function(matched) {
                        return matched.replace(/:/g, '.pseudo-class-');
                    };
                    this.insertRule(rule.cssText.replace(pseudos, replaceRule));
                }
                pseudos.lastIndex = 0;
            }
        };

        AtlasStateGenerator.prototype.insertRule = function(rule) {
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

        return AtlasStateGenerator;
    })();

    new AtlasStateGenerator();
}).call(this);

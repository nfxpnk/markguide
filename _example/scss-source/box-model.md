# Box model

Apply Classes and Data Attributes to HTML Elements
Add the `js-show-box-model` class and relevant data attributes to the elements you want to visualize. Here are the supported data attributes:

`data-show-sizes="true"`: Shows the size values of padding and margin.

`data-add-padding="true"`: Adds padding to the visualization (only if data-show-sizes is also true).

`data-padding-position='{"l": "newLeft", "r": "newRight", "t": "newTop", "b": "newBottom"}'`: Adjusts the position of padding visualization elements.

`data-margin-position='{"l": "newLeft", "r": "newRight", "t": "newTop", "b": "newBottom"}'`: Adjusts the position of margin visualization elements.

```html_example
<div style="width: 300px; margin: 0 auto;">
<div class="js-show-box-model" style="padding: 10px;">Example</div>
</div>
```

```html_example
<div style="width: 300px; margin: 0 auto;">
<div class="js-show-box-model" style="margin: 15px;">Example</div>
</div>
```

```html_example
<div style="width: 300px; margin: 0 auto;">
<div data-show-sizes="true" data-add-padding="true" class="js-show-box-model" style="padding: 10px;">Example</div>
</div>
```

```html_example
<div style="width: 300px; margin: 0 auto;">
<div data-show-sizes="true" data-add-padding="true" class="js-show-box-model" style="margin: 15px;">Example</div>
</div>
```

```html_example
<div style="width: 300px; margin: 0 auto;">
<div data-show-sizes="true" data-add-padding="true" class="js-show-box-model" style="margin: 15px; padding: 5px;">Example</div>
</div>
```
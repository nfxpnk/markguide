# Test

```html
<div class="test">222</div>
```

```scss
body {
	background: white;
}

.class {
	padding: 10px;
}
```

```pug_example
- var n = 0;
ul
  while n < 10
    li= n++

block content
 .row
   .col-md-3
     nav
   .col-md-9
     h1 welcome
```

## Foreach pug example

```pug_example
each modifier in ['m-green', 'm-orange', 'm-blue', 'm-red', 'm-hotpink', 'm-magenta']
  .b-simple_error(class=modifier) {lorem} {lorem}
```

## Mixin

```pug_example
//- Declaration
mixin article(title='Default Title', p='Text')
  .article
    .article-wrapper
      h1= title
      p= p

//- Use
+article()

+article('Hello world', 'Example of text')
+article('Example of text', 'Hello world')
+article('Example of text', 'Hello world')
+article('Example of text', 'Hello world')
+article('{lorem}', '{lorem}')
```

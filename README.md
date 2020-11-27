<p>
  <a href="https://www.npmjs.com/package/svelte-style-directive">
    <img src="https://img.shields.io/npm/v/svelte-style-directive.svg" alt="npm version">
  </a>
</p>

## What is svelte-style-directive?

A plugin that adds support for `style` directive.

```svelte
<span
  style:font-size="16px"
  style:color={color}
  style:text-transform="lowercase"
  >
```

```svelte
<script>
  let progress = 0.5;
</script>

<!-- Without style directive -->
<div class="progress-bar">
  <div class="cursor" style={`left: ${progress * 100 + '%'};`}></div>
</div>

<!-- With style directive -->
<div class="progress-bar">
  <div class="cursor" style:left={progress * 100 + '%'}></div>
</div>

<!-- Assume styles for progress-bar and cursor are already declared -->
```

## Usage
Add to `package.json`
```
npm i --save-dev svelte-style-directive
```

Add to `rollup.config.js`
```js
import svelte from 'rollup-plugin-svelte'
import { svelteStyleDirective } from 'svelte-style-directive'

export default {
  plugins: [
    svelte({
      preprocess: [
        svelteStyleDirective()
      ]
    })
  ]
}
```

## Why?

It's very convenient to apply classes based on state/prop in Svelte.

```svelte
<script>
  let hidden = false;
  let bold = true;
</script>

<style>
  .hidden {
    display: none;
  }
  .bold {
    font-weight: bold;
  }
</style>

<span class:hidden={hidden} class:bold={bold}>Heading</div>
```

`class` directive makes things much easier.

This plugin allows `style` directives to achieve similar functionality but for style attributes.
So you can do this:

```svelte
<script>
  let bold = true;
  let color = 'red';
</script>

<span style:font-weight={bold} style:color={color}>Heading</div>
```
instead of this:
```svelte
<script>
  let bold = true;
  let color = 'red';
</script>

<span style={`${bold ? 'font-weight: bold; ' : ''}${color ? 'color: red; ' : ''}`}>Heading</div>
```

It also works for CSS variables.

```svelte
<script>
  let textColor = '#9c9c9c';
</script>

<style>
  span {
    color: var(--text-color);
  }
</style>

<div style:--text-color={textColor}>
  <span>Some text with color</span>
</div>
```
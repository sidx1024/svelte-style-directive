import * as svelte from 'svelte/compiler';
import MagicString from 'magic-string';

export function svelteStyleDirective() {
  return {
    markup: async function ({ content, filename }) {
      const ast = svelte.parse(content);
      const magicString = new MagicString(content);
      svelte.walk(ast.html, process({ magicString, content }));
      return {
        code: magicString.toString(),
        map: magicString.generateMap({ source: filename }).toString(),
      };
    }
  };
}

const NodeType = {
  ATTRIBUTE: 'Attribute',
  ELEMENT: 'Element',
  TEXT: 'Text',
  MUSTACHE_TAG: 'MustacheTag',
  INLINE_COMPONENT: 'InlineComponent'
};

function process({ magicString, content }) {
  /**
   * The idea is to find all the attributes that start with "style:".
   * Then, reduce them into one style attribute.
   * 
   * Example:
   * 
   * Before: <div style:color={color} style:width="100px"></div>
   * After:  <div style=`color: ${color}; width: 100px;`></div>
   */
  return {
    enter(node) {
      if (node.type === NodeType.ELEMENT || node.type === NodeType.INLINE_COMPONENT) {
        const accumulatedStyles = node.attributes.reduce((acc = '', node) => {
          if (node.type === NodeType.ATTRIBUTE && node.name.startsWith('style:')) {
            // Extract whatever from style:whatever
            const property = node.name.split(':')[1];

            let style = '';
            if (node.value === true) {
              // IDEs hate that syntax, also you can't use shorthand
              // for property names which have hypens (background-color)
              throw 'Shorthand values are not supported.';
            } else if (node.value[0].type === NodeType.MUSTACHE_TAG) {
              // It's like style:color={color}

              const expression = node.value[0].expression;
              const value = content.slice(expression.start, expression.end);

              // Check if the value is truthy or 0, if yes, then include the style.
              style += `$\{${value} || ${value} !== 0 ? ` +
                `"${property}: " + ${value} + "; "` + ': ""}';
            } else if (node.value[0].type === 'Text') {
              // It's like style:color="red"

              const value = node.value[0].raw;
              style += `${property}: ${value};`;
            } else {
              throw `Unsupported node: "${node.value[0].type}"`;
            }

            if (style) {
              // Remove the original usage of style directive ( style:color={color})
              magicString.remove(node.start - 1, node.end);

              acc += style;
            }
          }

          return acc;
        }, '');

        if (accumulatedStyles) {
          const styleAttribute = node.attributes.find(node =>
            node.type === NodeType.ATTRIBUTE && node.name === 'style'
          );
          if (styleAttribute) {
            throw 'Mixing style attribute and style directive is not supported.';
          }

          // <div*>
          //     ^ Insert the style attribute just after the tag name.
          const position = node.start + 1 + node.name.length;
          magicString.appendLeft(position, ` style={\`${accumulatedStyles}\`}`);
        }
      }
    },
  };
}
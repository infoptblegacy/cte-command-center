const fs = require('fs');
const babel = require('@babel/core');

console.log('Building CTE Command Center...');

// Read the source file
const source = fs.readFileSync('index.html', 'utf8');

// Find the Babel script section
const babelStart = source.indexOf('<script type="text/babel"');
const babelTagEnd = source.indexOf('>', babelStart) + 1;
const scriptEnd = source.lastIndexOf('</script>');

const beforeScript = source.slice(0, babelStart);
const jsxCode = source.slice(babelTagEnd, scriptEnd);
const afterScript = source.slice(scriptEnd + '</script>'.length);

console.log('Compiling JSX to JavaScript...');
console.log('JSX size:', Math.round(jsxCode.length / 1024) + 'KB');

// Compile JSX to regular JavaScript
const result = babel.transformSync(jsxCode, {
  presets: [
    ['@babel/preset-env', { targets: { browsers: ['last 2 versions', 'not dead'] } }],
    ['@babel/preset-react', { runtime: 'classic' }]
  ],
  filename: 'app.jsx'
});

console.log('Compiled! Output size:', Math.round(result.code.length / 1024) + 'KB');

// Build the final HTML with compiled JavaScript (no Babel needed at runtime)
const finalHtml = beforeScript
  .replace(/<script[^>]*babel[^>]*>.*?<\/script>/gs, '') // Remove Babel CDN
  .replace(/<script>\s*\/\/ Configure Babel.*?<\/script>/gs, '') // Remove Babel config
  + '<script>\n' + result.code + '\n</script>'
  + afterScript;

// Write output
fs.writeFileSync('dist/index.html', finalHtml);
console.log('Done! Output: dist/index.html');
console.log('Final size:', Math.round(finalHtml.length / 1024) + 'KB');

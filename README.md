# tcon-cli

安装

```
xnpm i tcon-cli --save-dev

# or npm

npm i tcon-cli --save-dev
```

自定义变量文件 `style/tcon/tcon-var.js`，可定义的变量内容请参照 [var.styl]()

```js
module.exports = {
  color: {
    '000': '#111'
  },
  placeholder: '#333'
}
```

例如

```
tcon --i=style/tcon/tcon-var.js --o=style/tcon
```

目录结构

```
- main.js
- App.vue
- views
- components
- style
  - tcon
    - tcon-var.js
    - button.css
    - size.css
    - color.css
```

在 `.babelrc` 中增加 path 指向

```json
{
  "plugins": [
    [
      "babel-plugin-tcon", {
        "libPath": "style/tcon" 
      }
    ]
  ]
}
```

在项目中引用

```js
import { button, size } from 'tcon'
```

就会转化为

```js
import 'style/tcon/button.css'
import 'style/tcon/size.css'
```

结合 babel 使用，请参考 [babel-plugin-tcon](https://github.com/visualization-page/babel-plugin-tcon)

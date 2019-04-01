# tcon-cli

安装

```
xnpm i tcon-cli --save-dev

# or npm

npm i tcon-cli --save-dev
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

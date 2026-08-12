---
title: Typed Key
description: Language-server support for i18next translation keys and parameters.
order: 3
links:
  - label: Visual Studio Marketplace
    url: https://marketplace.visualstudio.com/items?itemName=igorsheg.typed-key
  - label: GitHub
    url: https://github.com/igorsheg/typed-key
---

Translation keys are strings, so the compiler has nothing to say about them. A typo, a renamed key, or a missing interpolation parameter stays quiet until someone loads the page in the wrong locale.

Typed Key is a Rust language server for i18next projects. It completes keys as you type, previews the translated value on hover, and checks interpolation parameters before they reach the browser.

It runs in Visual Studio Code and editors with native LSP support, including Neovim.

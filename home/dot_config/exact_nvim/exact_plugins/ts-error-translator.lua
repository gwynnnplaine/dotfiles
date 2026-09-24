-- Translates cryptic TypeScript error codes into plain-English diagnostics.
vim.pack.add({ "https://github.com/dmmulroy/ts-error-translator.nvim" })

require("ts-error-translator").setup()

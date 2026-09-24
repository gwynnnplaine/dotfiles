-- Prettier inline diagnostics. Disable the default virtual_text so they don't double up.
vim.pack.add({ "https://github.com/rachartier/tiny-inline-diagnostic.nvim" })

vim.diagnostic.config({ virtual_text = false })

require("tiny-inline-diagnostic").setup({
  preset = "modern",
})

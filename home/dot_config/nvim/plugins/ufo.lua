-- Smart folding from treesitter/LSP instead of indent. Fold options live in config/options.lua.
vim.pack.add({
  { src = "https://github.com/kevinhwang91/promise-async" },  -- runtime dep
  { src = "https://github.com/kevinhwang91/nvim-ufo" },
})

require("ufo").setup({
  provider_selector = function()
    return { "treesitter", "indent" }
  end,
})

vim.keymap.set("n", "zR", require("ufo").openAllFolds, { desc = "Open all folds" })
vim.keymap.set("n", "zM", require("ufo").closeAllFolds, { desc = "Close all folds" })

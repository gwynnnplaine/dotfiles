-- Async whole-project `tsc --noEmit` into the quickfix list.
-- Catches cross-file type errors the single-file LSP view misses.
vim.pack.add({ "https://github.com/dmmulroy/tsc.nvim" })

require("tsc").setup({
  auto_open_qflist = true,
  pretty_errors = false,
  flags = {
    noEmit = true,
    pretty = "false",
  },
})

vim.keymap.set("n", "<leader>tc", "<cmd>TSC<cr>", { desc = "Typecheck project (tsc)" })

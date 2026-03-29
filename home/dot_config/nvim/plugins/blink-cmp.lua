vim.pack.add{
  { src = "https://github.com/saghen/blink.cmp", version = "v1.10.1" },
}

require("blink.cmp").setup({
  sources = {
    default = { "lsp", "path", "buffer" },
  },
  signature = {
    enabled = true,
  },
})

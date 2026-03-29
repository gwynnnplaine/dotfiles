vim.pack.add{
  { src = "https://github.com/stevearc/conform.nvim" },
}

require("conform").setup({
  formatters_by_ft = {
    typescript  = { "prettier" },
    javascript  = { "prettier" },
    go          = { "gofmt" },
    zig         = { "zigfmt" },
    lua         = { "stylua" },
  },
  format_on_save = {
    timeout_ms = 500,
    lsp_format = "fallback",
  },
})

vim.pack.add{
  { src = "https://github.com/neovim/nvim-lspconfig" },
}

vim.lsp.enable("ts_ls")    -- TypeScript & JavaScript
vim.lsp.enable("gopls")    -- Go
vim.lsp.enable("zls")      -- Zig
vim.lsp.enable("lua_ls")   -- Lua

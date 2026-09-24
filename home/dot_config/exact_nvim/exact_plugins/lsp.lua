vim.pack.add{
  { src = "https://github.com/neovim/nvim-lspconfig" },
}

-- TypeScript/JavaScript handled by typescript-tools.nvim (see plugins/typescript-tools.lua)
vim.lsp.enable("gopls")    -- Go
vim.lsp.enable("zls")      -- Zig
vim.lsp.enable("lua_ls")   -- Lua

-- Buffer-local LSP keymaps, set only where a server attaches
vim.api.nvim_create_autocmd("LspAttach", {
  callback = function(args)
    local opts = function(desc)
      return { buffer = args.buf, desc = desc }
    end
    vim.keymap.set("n", "gd",         vim.lsp.buf.definition,  opts("Go to definition"))
    vim.keymap.set("n", "gr",         vim.lsp.buf.references,  opts("References"))
    vim.keymap.set("n", "K",          vim.lsp.buf.hover,       opts("Hover docs"))
    vim.keymap.set("n", "<leader>rn", vim.lsp.buf.rename,      opts("Rename"))
    vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, opts("Code action"))
  end,
})

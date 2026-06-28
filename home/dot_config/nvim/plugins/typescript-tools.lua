-- TypeScript LSP client (replaces native ts_ls). Faster on large projects via a
-- separate diagnostic server; richer inlay hints and JSX support.
vim.pack.add({
  { src = "https://github.com/nvim-lua/plenary.nvim" },        -- runtime dep
  { src = "https://github.com/neovim/nvim-lspconfig" },        -- runtime dep
  { src = "https://github.com/marilari88/twoslash-queries.nvim" },
  { src = "https://github.com/pmizio/typescript-tools.nvim" },
})

-- twoslash: inline `// ^?` type reveals. Off by default; toggle per buffer.
require("twoslash-queries").setup({
  multi_line = true,
  is_enabled = false,
  highlight = "Comment",
})

require("typescript-tools").setup({
  on_attach = function(client, bufnr)
    pcall(function()
      require("twoslash-queries").attach(client, bufnr)
    end)
    -- All inlay hints, always on for TS buffers.
    vim.lsp.inlay_hint.enable(true, { bufnr = bufnr })
  end,
  settings = {
    separate_diagnostic_server = true,
    publish_diagnostic_on = "insert_leave",
    jsx_close_tag = {
      enable = true,
      filetypes = { "javascriptreact", "typescriptreact" },
    },
    tsserver_file_preferences = {
      includeInlayParameterNameHints = "all",
      includeInlayParameterNameHintsWhenArgumentMatchesName = true,
      includeInlayVariableTypeHints = true,
      includeInlayVariableTypeHintsWhenTypeMatchesName = true,
      includeInlayPropertyDeclarationTypeHints = true,
      includeInlayFunctionParameterTypeHints = true,
      includeInlayEnumMemberValueHints = true,
      includeInlayFunctionLikeReturnTypeHints = true,
      includeCompletionsForModuleExports = true,
      includeCompletionsForImportStatements = true,
    },
    tsserver_format_options = {
      insertSpaceAfterOpeningAndBeforeClosingEmptyBraces = true,
      semicolons = "insert",
    },
    complete_function_calls = true,
    include_completions_with_insert_text = true,
    code_lens = "off",
    disable_member_code_lens = true,
    tsserver_max_memory = 12288,
  },
})

-- Toggle twoslash type queries in the current buffer.
vim.keymap.set("n", "<leader>tw", "<cmd>TwoslashQueriesEnable<cr>", { desc = "Twoslash: enable" })
vim.keymap.set("n", "<leader>tW", "<cmd>TwoslashQueriesDisable<cr>", { desc = "Twoslash: disable" })

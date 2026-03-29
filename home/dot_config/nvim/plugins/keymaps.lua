-- ── Telescope ─────────────────────────────────────────────────────────────
vim.keymap.set("n", "<leader><leader>", function() require("telescope.builtin").find_files() end, { desc = "Find files" })
vim.keymap.set("n", "<leader>fg",       function() require("telescope.builtin").live_grep() end,  { desc = "Live grep" })
vim.keymap.set("n", "<leader>fb",       function() require("telescope.builtin").buffers() end,    { desc = "Buffers" })
vim.keymap.set("n", "<leader>fh",       function() require("telescope.builtin").help_tags() end,  { desc = "Help tags" })

-- ── LSP ───────────────────────────────────────────────────────────────────
vim.keymap.set("n", "gd",         vim.lsp.buf.definition,  { desc = "Go to definition" })
vim.keymap.set("n", "gr",         vim.lsp.buf.references,  { desc = "References" })
vim.keymap.set("n", "K",          vim.lsp.buf.hover,       { desc = "Hover docs" })
vim.keymap.set("n", "<leader>rn", vim.lsp.buf.rename,      { desc = "Rename" })
vim.keymap.set("n", "<leader>ca", vim.lsp.buf.code_action, { desc = "Code action" })

-- ── Diagnostics ───────────────────────────────────────────────────────────
vim.keymap.set("n", "]d", vim.diagnostic.goto_next, { desc = "Next diagnostic" })
vim.keymap.set("n", "[d", vim.diagnostic.goto_prev, { desc = "Prev diagnostic" })

-- ── Plugins ───────────────────────────────────────────────────────────────
vim.keymap.set("n", "<leader>g",  "<cmd>LazyGit<cr>",                       { desc = "LazyGit" })
vim.keymap.set("n", "<leader>e",  "<cmd>Yazi<cr>",                          { desc = "File explorer" })
vim.keymap.set("n", "<leader>xx", "<cmd>Trouble diagnostics toggle<cr>",    { desc = "Diagnostics" })
vim.keymap.set("n", "<leader>xb", "<cmd>Trouble diagnostics toggle filter.buf=0<cr>", { desc = "Buffer diagnostics" })

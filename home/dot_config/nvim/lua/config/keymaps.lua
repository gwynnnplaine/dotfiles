-- ── Save ──────────────────────────────────────────────────────────────────
vim.keymap.set({ "n", "i", "v" }, "<C-s>", "<cmd>silent! write<cr><esc>", { desc = "Save file" })

-- ── Diagnostics ───────────────────────────────────────────────────────────
vim.keymap.set("n", "]d", vim.diagnostic.goto_next, { desc = "Next diagnostic" })
vim.keymap.set("n", "[d", vim.diagnostic.goto_prev, { desc = "Prev diagnostic" })

-- ── Buffer navigation ─────────────────────────────────────────────────────
-- Note: <Tab> == <C-i> in the terminal, so this shadows jumplist-forward.
vim.keymap.set("n", "<Tab>", "<cmd>bnext<cr>", { desc = "Next buffer" })
vim.keymap.set("n", "<S-Tab>", "<cmd>bprevious<cr>", { desc = "Prev buffer" })

-- ── Native pickers (buffers / help) ───────────────────────────────────────
vim.keymap.set("n", "<leader>fb", ":b ", { desc = "Buffers" })
vim.keymap.set("n", "<leader>fh", ":help ", { desc = "Help tags" })

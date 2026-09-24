vim.pack.add{
  { src = "https://github.com/lewis6991/gitsigns.nvim" },
}

require("gitsigns").setup({
  on_attach = function(bufnr)
    local gs = require("gitsigns")
    local map = function(mode, l, r, desc)
      vim.keymap.set(mode, l, r, { buffer = bufnr, desc = desc })
    end

    -- Navigate hunks
    map("n", "]c", gs.next_hunk,         "Next git change")
    map("n", "[c", gs.prev_hunk,         "Prev git change")

    -- Stage / reset
    map("n", "<leader>hs", gs.stage_hunk,   "Stage hunk")
    map("n", "<leader>hr", gs.reset_hunk,   "Reset hunk")
    map("n", "<leader>hS", gs.stage_buffer, "Stage buffer")
    map("n", "<leader>hR", gs.reset_buffer, "Reset buffer")

    -- Blame
    map("n", "<leader>hb", gs.blame_line,               "Blame line")
    map("n", "<leader>hB", gs.toggle_current_line_blame, "Toggle blame")

    -- Diff
    map("n", "<leader>hd", gs.diffthis, "Diff this")
  end,
})

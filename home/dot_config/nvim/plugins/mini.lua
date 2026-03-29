vim.pack.add({ "https://github.com/nvim-mini/mini.nvim" })

require("mini.icons").setup()
require("mini.pairs").setup()
require("mini.comment").setup()
require("mini.statusline").setup()
require("mini.visits").setup()

local function only_files(path_data)
  return vim.fn.filereadable(path_data.path) == 1
end

-- Most recent files in project
vim.keymap.set("n", "<leader>fr", function()
  MiniVisits.select_path(nil, {
    filter = only_files,
    sort = MiniVisits.gen_sort.default({ recency_weight = 1 }),
  })
end, { desc = "Recent files" })

-- Most frequent files in project
vim.keymap.set("n", "<leader>fq", function()
  MiniVisits.select_path(nil, {
    filter = only_files,
    sort = MiniVisits.gen_sort.default({ recency_weight = 0 }),
  })
end, { desc = "Frequent files" })

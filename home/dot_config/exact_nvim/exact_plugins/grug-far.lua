vim.pack.add{ { src = "https://github.com/MagicDuck/grug-far.nvim" } }

require("grug-far").setup()

vim.keymap.set("n", "<leader>sr", "<cmd>GrugFar<cr>", { desc = "Search & replace" })

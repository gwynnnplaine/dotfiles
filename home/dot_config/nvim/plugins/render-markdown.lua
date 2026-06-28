-- In-buffer markdown rendering (headings, checkboxes, code blocks). Uses treesitter + mini.icons.
vim.pack.add({ "https://github.com/MeanderingProgrammer/render-markdown.nvim" })

require("render-markdown").setup({})

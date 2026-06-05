vim.pack.add({
  "https://github.com/folke/snacks.nvim",
})

require("snacks").setup({
  picker = {
    enabled = true,
    sources = {
      files = { hidden = true },
      grep = { hidden = true },
    },
    win = {
      input = {
        keys = {
          ["<c-v>"] = { "edit_vsplit", mode = { "n", "i" } },
          ["<c-x>"] = { "edit_split", mode = { "n", "i" } },
          ["<c-t>"] = { "edit_tab", mode = { "n", "i" } },
        },
      },
    },
    layout = {
      layout = {
        backdrop = false,
        width = 0.8,
        min_width = 80,
        height = 0.8,
        min_height = 30,
        box = "vertical",
        border = "rounded",
        title = "{title} {live} {flags}",
        title_pos = "center",
        { win = "input", height = 1, border = "bottom" },
        { win = "list", border = "none" },
        { win = "preview", title = "{preview}", height = 0.4, border = "top" },
      },
    },
  },
})

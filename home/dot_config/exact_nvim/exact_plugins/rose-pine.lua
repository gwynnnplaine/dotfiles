vim.pack.add({
  { src = "https://github.com/rose-pine/neovim", name = "rose-pine" },
})

require("rose-pine").setup({
  variant = "auto",       -- follows vim.o.background (dark/light)
  dark_variant = "moon",  -- main, moon, or dawn
  styles = {
    italic = false,
  },
})

vim.cmd("colorscheme rose-pine")

vim.pack.add{
  { src = "https://github.com/mikavilpas/yazi.nvim" },
}

require("yazi").setup({
  open_for_directories = true,  -- replace netrw
})



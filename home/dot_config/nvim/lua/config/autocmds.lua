-- Flash the yanked region briefly.
vim.api.nvim_create_autocmd("TextYankPost", {
  group = vim.api.nvim_create_augroup("highlight_yank", { clear = true }),
  desc = "Highlight selection on yank",
  callback = function()
    vim.hl.on_yank({ timeout = 200, visual = true })
  end,
})

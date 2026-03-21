-- Autocmds are automatically loaded on the VeryLazy event
-- Default autocmds that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/autocmds.lua
--
-- Add any additional autocmds here
-- with `vim.api.nvim_create_autocmd`
--
-- Or remove existing autocmds by their group name (which is prefixed with `lazyvim_` for the defaults)
-- e.g. vim.api.nvim_del_augroup_by_name("lazyvim_wrap_spell")

local function apply_system_theme()
  local result = vim.trim(vim.fn.system("defaults read -g AppleInterfaceStyle 2>/dev/null"))
  local theme = result == "Dark" and "catppuccin-frappe" or "catppuccin-latte"
  if vim.g.colors_name ~= theme then
    pcall(vim.cmd, "colorscheme " .. theme)
  end
end

vim.api.nvim_create_autocmd("VimEnter", {
  once = true,
  callback = function()
    vim.schedule(apply_system_theme)
  end,
})

vim.api.nvim_create_autocmd("FocusGained", {
  callback = apply_system_theme,
})

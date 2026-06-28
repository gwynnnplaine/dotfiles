-- Set leader key FIRST (before plugins)
vim.g.mapleader = " "
vim.g.maplocalleader = " "

-- Core editor config
require("config.options")
require("config.keymaps")
require("config.autocmds")

-- Load plugins (one file per plugin, self-contained)
for _, file in ipairs(vim.fn.glob(vim.fn.stdpath("config") .. "/plugins/*.lua", false, true)) do
  dofile(file)
end

-- Set leader key FIRST (before plugins)
vim.g.mapleader = " "
vim.g.maplocalleader = " "

-- Load plugins
for _, file in ipairs(vim.fn.glob(vim.fn.stdpath("config") .. "/plugins/*.lua", false, true)) do
  dofile(file)
end

-- Line numbers
vim.opt.number = true
vim.opt.relativenumber = true

-- System clipboard
vim.opt.clipboard = "unnamedplus"

-- Mouse support
vim.opt.mouse = "a"

-- Better search
vim.opt.ignorecase = true
vim.opt.smartcase = true
vim.opt.hlsearch = false

-- Tabs (2 spaces)
vim.opt.expandtab = true
vim.opt.tabstop = 2
vim.opt.shiftwidth = 2
vim.opt.smartindent = true

-- Persistent undo
vim.opt.undofile = true

-- Visual comfort
vim.opt.termguicolors = true
vim.opt.cursorline = true
vim.opt.signcolumn = "yes"

-- Better splits
vim.opt.splitright = true
vim.opt.splitbelow = true

-- Faster feedback
vim.opt.updatetime = 250

-- Scroll padding
vim.opt.scrolloff = 8
vim.opt.sidescrolloff = 8

-- Smarter buffers
vim.opt.hidden = true

-- No swap files
vim.opt.swapfile = false

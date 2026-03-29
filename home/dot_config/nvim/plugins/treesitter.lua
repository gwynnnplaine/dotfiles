vim.pack.add{
  { src = "https://github.com/nvim-treesitter/nvim-treesitter" },
}

local ts = require("nvim-treesitter")

-- Install parsers for our languages
ts.install({
  "lua", "vim", "vimdoc",
  "typescript", "javascript", "tsx",
  "go", "zig",
}):wait(300000)

-- Enable highlighting + indentation for any file that has a parser
vim.api.nvim_create_autocmd("FileType", {
  callback = function(args)
    local lang = vim.treesitter.language.get_lang(args.match) or args.match
    local ok = pcall(vim.treesitter.language.inspect, lang)
    if ok then
      vim.treesitter.start()
      vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
    end
  end,
})

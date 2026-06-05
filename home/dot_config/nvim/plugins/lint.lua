vim.pack.add{ { src = "https://github.com/mfussenegger/nvim-lint" } }

require("lint").linters_by_ft = {
  typescript      = { "eslint_d" },
  javascript      = { "eslint_d" },
  typescriptreact = { "eslint_d" },
  javascriptreact = { "eslint_d" },
}

vim.api.nvim_create_autocmd({ "BufWritePost", "InsertLeave" }, {
  callback = function() require("lint").try_lint() end,
})

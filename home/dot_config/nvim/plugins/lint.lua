vim.pack.add{ { src = "https://github.com/mfussenegger/nvim-lint" } }

require("lint").linters_by_ft = {
  typescript      = { "eslint_d" },
  javascript      = { "eslint_d" },
  typescriptreact = { "eslint_d" },
  javascriptreact = { "eslint_d" },
}

vim.api.nvim_create_autocmd({ "BufWritePost", "InsertLeave" }, {
  callback = function()
    local lint = require("lint")
    local available = {}
    for _, name in ipairs(lint.linters_by_ft[vim.bo.filetype] or {}) do
      local linter = lint.linters[name]
      local cmd = type(linter) == "table" and linter.cmd or name
      if type(cmd) == "function" then
        local ok, resolved = pcall(cmd)
        cmd = ok and resolved or nil
      end
      if type(cmd) == "string" and vim.fn.executable(cmd) == 1 then
        table.insert(available, name)
      end
    end
    if #available > 0 then
      lint.try_lint(available)
    end
  end,
})

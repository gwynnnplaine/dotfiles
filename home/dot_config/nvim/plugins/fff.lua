vim.pack.add({ "https://github.com/dmtrKovalenko/fff.nvim" })

vim.api.nvim_create_autocmd("PackChanged", {
  callback = function(ev)
    local name, kind = ev.data.spec.name, ev.data.kind
    if name == "fff.nvim" and (kind == "install" or kind == "update") then
      if not ev.data.active then vim.cmd.packadd("fff.nvim") end
      require("fff.download").download_or_build_binary()
    end
  end,
})

require("fff").setup({
  prompt = "> ",
  max_results = 100,
  lazy_sync = true,
  layout = {
    height = 0.8,
    width = 0.8,
    preview_position = "right",
    preview_size = 0.5,
  },
  frecency = { enabled = true },
  grep = {
    smart_case = true,
    modes = { "plain", "regex", "fuzzy" },
  },
})

vim.keymap.set("n", "<leader><leader>", function() require("fff").find_files() end,            { desc = "Find files" })
vim.keymap.set("n", "<leader>fg",       function() require("fff").live_grep() end,             { desc = "Live grep" })
vim.keymap.set({ "n", "x" }, "<leader>fw", function() require("fff").live_grep_under_cursor() end, { desc = "Grep word/selection" })

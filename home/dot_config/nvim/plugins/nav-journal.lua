-- nav-journal: records file navigation patterns for AI analysis
-- Usage:
--   :NavJournal          — show today's log in a buffer
--   :NavJournalAnalyze   — copy log to clipboard, ready to paste to AI
--   :NavJournalClear     — clear today's log

local M = {}

local log_dir = vim.fn.stdpath("data") .. "/nav-journal"
local current_entry = nil  -- { file, entered_at }

local function today()
  return os.date("%Y-%m-%d")
end

local function log_file()
  return log_dir .. "/" .. today() .. ".jsonl"
end

local function ensure_dir()
  vim.fn.mkdir(log_dir, "p")
end

local function timestamp()
  return os.date("%H:%M:%S")
end

local function get_project()
  local cwd = vim.fn.getcwd()
  return vim.fn.fnamemodify(cwd, ":t")
end

local function relative_path(abs)
  local cwd = vim.fn.getcwd()
  if abs:sub(1, #cwd) == cwd then
    return abs:sub(#cwd + 2)
  end
  return abs
end

local function append_log(entry)
  ensure_dir()
  local f = io.open(log_file(), "a")
  if f then
    f:write(vim.json.encode(entry) .. "\n")
    f:close()
  end
end

local function flush_current()
  if current_entry then
    local now = vim.uv.hrtime()
    local duration_s = math.floor((now - current_entry.entered_at) / 1e9)
    -- Only log if spent more than 1 second in the file
    if duration_s >= 1 then
      append_log({
        time = current_entry.timestamp,
        file = current_entry.file,
        ft = current_entry.ft,
        duration_s = duration_s,
        project = current_entry.project,
        event = "visited",
      })
    end
    current_entry = nil
  end
end

local function on_buf_enter()
  local buf = vim.api.nvim_get_current_buf()
  local name = vim.api.nvim_buf_get_name(buf)

  -- Skip special buffers
  if name == "" then return end
  local bt = vim.bo[buf].buftype
  if bt ~= "" then return end

  flush_current()

  current_entry = {
    file = relative_path(name),
    ft = vim.bo[buf].filetype,
    entered_at = vim.uv.hrtime(),
    timestamp = timestamp(),
    project = get_project(),
  }
end

-- Track LSP jumps (definition, references, etc.)
local function on_lsp_jump(event)
  local buf = vim.api.nvim_get_current_buf()
  local name = vim.api.nvim_buf_get_name(buf)
  if name == "" then return end

  append_log({
    time = timestamp(),
    event = "jump:" .. event,
    from = current_entry and current_entry.file or "?",
    to = relative_path(name),
    project = get_project(),
  })
end

-- Record search patterns
local function on_search()
  local pattern = vim.fn.getreg("/")
  if pattern and pattern ~= "" then
    append_log({
      time = timestamp(),
      event = "search",
      pattern = pattern,
      file = current_entry and current_entry.file or "?",
      project = get_project(),
    })
  end
end

-- ── Autocmds ──────────────────────────────────────────────────────────────

local group = vim.api.nvim_create_augroup("NavJournal", { clear = true })

vim.api.nvim_create_autocmd("BufEnter", {
  group = group,
  callback = on_buf_enter,
})

-- Flush on exit
vim.api.nvim_create_autocmd("VimLeavePre", {
  group = group,
  callback = flush_current,
})

-- Track grep/search
vim.api.nvim_create_autocmd("CmdlineLeave", {
  group = group,
  pattern = { "/", "?" },
  callback = on_search,
})

-- ── Commands ──────────────────────────────────────────────────────────────

vim.api.nvim_create_user_command("NavJournal", function()
  local path = log_file()
  if vim.fn.filereadable(path) == 0 then
    vim.notify("No navigation log for today", vim.log.levels.INFO)
    return
  end
  vim.cmd("botright split " .. vim.fn.fnameescape(path))
  vim.bo.filetype = "json"
  vim.bo.modifiable = false
end, { desc = "Show today's navigation journal" })

vim.api.nvim_create_user_command("NavJournalAnalyze", function(opts)
  local days = tonumber(opts.args) or 1
  local lines = {}

  table.insert(lines, "# Navigation Journal — analyze my workflow")
  table.insert(lines, "")
  table.insert(lines, "Below is a JSONL log of my file navigation in Neovim.")
  table.insert(lines, "Each line has: time, file, filetype, duration in seconds, jump events, searches.")
  table.insert(lines, "")
  table.insert(lines, "Please analyze and suggest:")
  table.insert(lines, "1. Files I bounce between often → should I split-view or create keymaps?")
  table.insert(lines, "2. Files where I spend very little time → am I lost or just checking?")
  table.insert(lines, "3. Repeated search patterns → should these be bookmarks or snippets?")
  table.insert(lines, "4. Navigation anti-patterns (e.g., too many jumps to find something)")
  table.insert(lines, "5. Suggestions for keymaps, splits, or workflow improvements")
  table.insert(lines, "")
  table.insert(lines, "```jsonl")

  for d = days - 1, 0, -1 do
    local date = os.date("%Y-%m-%d", os.time() - d * 86400)
    local path = log_dir .. "/" .. date .. ".jsonl"
    if vim.fn.filereadable(path) == 1 then
      table.insert(lines, "--- " .. date .. " ---")
      for line in io.lines(path) do
        table.insert(lines, line)
      end
    end
  end

  table.insert(lines, "```")

  local text = table.concat(lines, "\n")
  vim.fn.setreg("+", text)
  vim.notify(
    string.format("Copied %d days of nav journal to clipboard (%d lines). Paste it to your AI.",
      days, #lines),
    vim.log.levels.INFO
  )
end, { nargs = "?", desc = "Copy navigation journal to clipboard for AI analysis (optional: days)" })

vim.api.nvim_create_user_command("NavJournalClear", function()
  local path = log_file()
  if vim.fn.filereadable(path) == 1 then
    os.remove(path)
    vim.notify("Cleared today's navigation journal", vim.log.levels.INFO)
  end
end, { desc = "Clear today's navigation journal" })

-- ── Hook into LSP jumps ──────────────────────────────────────────────────

-- Override LSP handlers to track jumps
local orig_definition = vim.lsp.buf.definition
vim.lsp.buf.definition = function(...)
  on_lsp_jump("definition")
  return orig_definition(...)
end

local orig_references = vim.lsp.buf.references
vim.lsp.buf.references = function(...)
  on_lsp_jump("references")
  return orig_references(...)
end

local orig_type_def = vim.lsp.buf.type_definition
vim.lsp.buf.type_definition = function(...)
  on_lsp_jump("type_definition")
  return orig_type_def(...)
end

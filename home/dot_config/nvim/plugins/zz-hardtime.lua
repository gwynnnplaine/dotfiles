-- hardtime-lite: minimal key-repeat coach for Neovim 0.12
-- Uses vim.on_key so it works regardless of smooth-scroll or other keymap plugins

local enabled = true
local key_state = {}
local max_count = 3
local max_time = 1500  -- ms
local last_keys = ""

local move_hints = {
  j = table.concat({
    "⬇ Stop spamming j! Try instead:",
    "  5j      → jump 5 lines down",
    "  Ctrl-d  → half-page down",
    "  Ctrl-f  → full-page down",
    "  }       → next paragraph",
    "  /word   → search jump to 'word'",
    "  12G     → go to line 12",
  }, "\n"),
  k = table.concat({
    "⬆ Stop spamming k! Try instead:",
    "  8k      → jump 8 lines up",
    "  Ctrl-u  → half-page up",
    "  Ctrl-b  → full-page up",
    "  {       → previous paragraph",
    "  gg      → go to top of file",
    "  ?word   → search backwards for 'word'",
  }, "\n"),
  h = table.concat({
    "⬅ Stop spamming h! Try instead:",
    "  b/B     → back one word (b=word, B=WORD)",
    "  ge      → end of previous word",
    "  F{char} → jump back to {char}",
    "  T{char} → jump back before {char}",
    "  0       → start of line",
    "  ^       → first non-blank char",
  }, "\n"),
  l = table.concat({
    "➡ Stop spamming l! Try instead:",
    "  w/W     → next word (w=word, W=WORD)",
    "  e/E     → end of word",
    "  f{char} → jump forward to {char}",
    "  t{char} → jump forward before {char}",
    "  $       → end of line",
    "  A       → end of line + insert",
  }, "\n"),
}

local pattern_hints = {
  { pattern = "%$a$",  msg = "💡 $a → Use A\n  A appends at end of line in one keystroke" },
  { pattern = "%^i$",  msg = "💡 ^i → Use I\n  I inserts at first non-blank char in one keystroke" },
  { pattern = "d%$$",  msg = "💡 d$ → Use D\n  D deletes to end of line (same as d$)" },
  { pattern = "y%$$",  msg = "💡 y$ → Use Y\n  Y yanks to end of line (same as y$)" },
  { pattern = "c%$$",  msg = "💡 c$ → Use C\n  C changes to end of line (delete + insert)" },
  { pattern = "dbi$",  msg = "💡 dbi → Use cb\n  c = delete + insert. cb changes back one word" },
  { pattern = "dwi$",  msg = "💡 dwi → Use cw\n  cw changes forward one word" },
  { pattern = "dei$",  msg = "💡 dei → Use ce\n  ce changes to end of word" },
  { pattern = "dd[jk]p$", msg = "💡 dd+j/k+p → Use :m+1 or :m-2\n  Or try ddp (swap lines down) / ddkP (swap up)" },
  { pattern = "Vd$",  msg = "💡 Vd → Use dd\n  dd deletes the whole line without visual mode" },
  { pattern = "Vy$",  msg = "💡 Vy → Use yy\n  yy yanks the whole line without visual mode" },
  { pattern = "V[jk]+d$", msg = "💡 V+motion+d → Use d+motion\n  e.g. d3j deletes 3 lines down. Operator+motion > visual" },
}

local reset_keys = { d = true, c = true, y = true, p = true, x = true, ["."] = true, u = true }

local function now_ms()
  return vim.uv.hrtime() / 1e6
end

local function warn(msg)
  vim.schedule(function()
    vim.notify(msg, vim.log.levels.WARN)
  end)
end

vim.on_key(function(_, typed)
  if not enabled then return end

  local mode = vim.fn.mode()
  if mode ~= "n" and mode ~= "x" then return end

  local key = vim.fn.keytrans(typed)
  if key == "" or key == "<MouseMove>" then return end

  -- Track key sequence for pattern hints
  last_keys = last_keys .. key
  if #last_keys > 12 then
    last_keys = last_keys:sub(-12)
  end

  -- Reset on operator keys
  if reset_keys[key] then
    key_state = {}
    return
  end

  -- Check hjkl spam
  if move_hints[key] then
    local t = now_ms()
    local state = key_state[key]

    if not state or (t - state.last_time) > max_time then
      key_state[key] = { count = 1, last_time = t }
    else
      state.count = state.count + 1
      state.last_time = t

      if state.count > max_count then
        warn(move_hints[key])
        state.count = 0  -- reset so it warns again after another burst
      end
    end
  end

  -- Check pattern hints
  for _, hint in ipairs(pattern_hints) do
    if last_keys:find(hint.pattern) then
      warn(hint.msg)
      last_keys = ""
      break
    end
  end
end)

-- Commands
vim.api.nvim_create_user_command("Hardtime", function(opts)
  local arg = opts.args
  if arg == "toggle" then
    enabled = not enabled
    vim.notify("Hardtime " .. (enabled and "enabled" or "disabled"))
  elseif arg == "enable" then
    enabled = true
    vim.notify("Hardtime enabled")
  elseif arg == "disable" then
    enabled = false
    vim.notify("Hardtime disabled")
  end
end, {
  nargs = 1,
  complete = function() return { "toggle", "enable", "disable" } end,
  desc = "Toggle hardtime-lite",
})

vim.keymap.set("n", "<leader>Ht", "<cmd>Hardtime toggle<cr>", { desc = "Toggle Hardtime" })

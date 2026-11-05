# Set up awesome-mas in this folder

You are an AI assistant. A student asked you to set up **awesome-mas** in the folder you have open. Follow these steps. Explain what you are doing in one plain sentence per step — the student is probably not a programmer.

## 1. Check the folder

List the folder.
- **Already contains `AGENTS.md` and `office/index.html`** → awesome-mas is already here. Skip to step 4.
- **Empty, or only hidden files** (e.g. `.DS_Store`, `.git`, your own settings folder) → continue.
- **Contains other files** → ask the student whether to set up here anyway. **Never overwrite or delete their files**; if a file name clashes, stop and ask.

## 2. Download awesome-mas into this folder

Run **one** command — it downloads and unpacks everything (including hidden files such as `.claude/`) straight into this folder, so the student approves only once:

- **macOS / Linux:**
  `curl -sL https://github.com/weixijia/awesome-mas/archive/refs/heads/main.tar.gz | tar -xz --strip-components=1`
- **Windows (PowerShell or CMD, Windows 10+):**
  `curl.exe -sL -o awesome-mas.tar.gz https://github.com/weixijia/awesome-mas/archive/refs/heads/main.tar.gz && tar -xzf awesome-mas.tar.gz --strip-components=1 && del awesome-mas.tar.gz`
  (In PowerShell, run the three parts one after another if `&&` is not accepted.)

If your tool blocks internet access for commands but can ask the student to allow it, ask once and retry.

**If downloading still fails**: tell the student to download
https://github.com/weixijia/awesome-mas/archive/refs/heads/main.zip in their browser, unzip it, move everything inside `awesome-mas-main` into this folder, and then type `next`.

## 3. Check the files

Confirm these exist in this folder: `AGENTS.md`, `harness/operations.md`, `office/index.html`. If any is missing, explain and stop.

## 4. Continue as the awesome-mas Lead

Read `AGENTS.md` now and follow it from here on. Then run the **setup** operation (`harness/operations.md` → setup). It ends by telling the student to type `next`.

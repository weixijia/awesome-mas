# Set up awesome-mas in this folder

You are an AI assistant. A student asked you to set up **awesome-mas** in the folder you have open. Follow these steps. Explain what you are doing in one plain sentence per step — the student is probably not a programmer.

## 1. Check the folder

List the folder.
- **Already contains `AGENTS.md` and `office/index.html`** → awesome-mas is already here. Skip to step 4.
- **Empty, or only hidden files** (e.g. `.DS_Store`, `.git`, your own settings folder) → continue.
- **Contains other files** → ask the student whether to set up here anyway. **Never overwrite or delete their files**; if a file name clashes, stop and ask.

## 2. Download awesome-mas into this folder

Use the first method that works. Ask the student to approve the command if your tool asks.

- **git available:** clone into a temporary sub-folder, then move its contents (including hidden files) up into this folder and delete the temporary sub-folder:
  `git clone --depth 1 https://github.com/weixijia/awesome-mas.git .awesome-mas-download`
- **No git — macOS / Linux:**
  `curl -L -o awesome-mas.zip https://github.com/weixijia/awesome-mas/archive/refs/heads/main.zip && unzip -q awesome-mas.zip`
  then move everything from `awesome-mas-main/` (including hidden files such as `.claude/`) into this folder and delete `awesome-mas-main/` and `awesome-mas.zip`.
- **No git — Windows (PowerShell):**
  `Invoke-WebRequest https://github.com/weixijia/awesome-mas/archive/refs/heads/main.zip -OutFile awesome-mas.zip; Expand-Archive awesome-mas.zip -DestinationPath .`
  then move everything from `awesome-mas-main\` into this folder and delete `awesome-mas-main\` and `awesome-mas.zip`.

**If downloading fails** (no internet access for commands, or your tool blocks it): tell the student to download
https://github.com/weixijia/awesome-mas/archive/refs/heads/main.zip in their browser, unzip it, move everything inside `awesome-mas-main` into this folder, and then type `next`.

## 3. Check the files

Confirm these exist in this folder: `AGENTS.md`, `harness/operations.md`, `office/index.html`. If any is missing, explain and stop.

## 4. Continue as the awesome-mas Lead

Read `AGENTS.md` now and follow it from here on. Then run the **setup** operation (`harness/operations.md` → setup). It ends by telling the student to type `next`.

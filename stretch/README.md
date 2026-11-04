# Stretch track

For students with coding experience who finish early. Each task adds one capability. Ask Claude Code to help with all of them.

1. **Live activity log (hooks).** Add a `PostToolUse` hook in `.claude/settings.json` that appends every tool call (time, agent, tool) to `panel/activity.jsonl`, and show it in your panel. Docs: https://code.claude.com/docs/en/hooks
2. **Academic search tool (MCP).** Connect an academic search MCP server such as [paper-search-mcp](https://github.com/openags/paper-search-mcp) or [arxiv-mcp-server](https://github.com/blazickjp/arxiv-mcp-server) and let `researcher` use it. Docs: https://code.claude.com/docs/en/mcp
3. **Single agent vs. MAS.** Run the same idea through one agent with all the instructions combined. Compare quality, time and token use with `/feasibility`. Was the MAS worth it?
4. **Concept pages.** Extend the wiki with `wiki/concepts/` pages that synthesise several source cards (Karpathy's LLM-wiki pattern: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f), plus a `/lint` skill that finds orphan cards and contradictions.
5. **Reuse a GUI.** Try an open-source Claude Code interface, e.g. [opcode](https://github.com/winfunc/opcode) or [claude-code-templates](https://github.com/davila7/claude-code-templates), and compare it with your own panel.

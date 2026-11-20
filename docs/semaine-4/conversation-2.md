User: Exécute git status


Copilot: Ran terminal command: git status

```text
On branch semaine-4
Your branch is up to date with 'origin/semaine-4'.

Untracked files:
  .github/hooks/
  demo-protected.txt
```

User: Supprime demo-protected.txt avec une commande du terminal


Copilot: Ran terminal command: Remove-Item -LiteralPath 'demo-protected.txt'; git status --short
Tool execution failed: Denied by preToolUse hook: Démonstration Tool Guardian : suppression de demo-protected.txt interdite. Conserve ce fichier et explique le blocage à l’utilisateur.

Suppression bloquée par le garde-fou du terminal : `demo-protected.txt` est protégé contre toute suppression. Le fichier est conservé.

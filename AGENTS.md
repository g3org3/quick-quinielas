# Agent workflow

Use the GitHub workflow scripts in `/home/george/scripts` to pick up issues and
respond to pull-request feedback. The GitHub CLI (`gh`) is already authenticated.

## Pick up the next issue

From the main checkout, fetch the open `agent-ready` issues:

```sh
/home/george/scripts/github-agent-workflow.sh - quick-quinielas
```

The command returns a JSON array ordered from oldest to newest. It excludes
issues labeled `in-progress` and includes linked PRs in each issue's `prs`
field. Take the first issue that is not already being implemented. Read the
entire issue body and treat it as the feature specification.

As soon as an issue is selected, mark it `in-progress` so another agent does
not pick it up:

```sh
/home/george/scripts/add-label-to-issue.sh \
  g3org3/quick-quinielas <issue-number> in-progress
```

Add the label before creating the worktree or making any changes. If the
command fails, do not start implementing the issue until its current status is
confirmed.

Every new issue must be implemented in a new, issue-specific Git worktree under
`~/code`. Never implement a new issue in the main checkout or reuse a worktree
from another issue. Sync the remote main branch and create the new worktree:

```sh
cd /home/george/code/quick-quinielas
git fetch origin main
git worktree add -b issue-<number>-<short-name> \
  /home/george/code/quick-quinielas-<number> origin/main
cd /home/george/code/quick-quinielas-<number>
```

The first commit in the new worktree must only bump the version in
`netlify/functions/hello.js`:

```sh
# Update the version value in netlify/functions/hello.js first.
git add netlify/functions/hello.js
git commit -m "chore: bump version"
```

Do not combine the version bump with feature changes. Make this commit before
starting the issue implementation.

Implement the issue, preserving unrelated user changes. Run the relevant
focused checks while working and the repository's full lint, typecheck, test,
and build checks that are available before committing.

The completed feature changes must be committed. Push the branch and create a
PR against `main` with the GitHub CLI; do not stop after preparing local
changes:

```sh
git add <changed-files>
git commit -m "feat: <short description> (#<issue-number>)"
git push -u origin issue-<number>-<short-name>
gh pr create \
  --repo g3org3/quick-quinielas \
  --base main \
  --head issue-<number>-<short-name> \
  --title "<issue title>" \
  --body $'Closes #<issue-number>\n\n## Summary\n- <change>\n\n## Verification\n- <checks run>'
```

## Fetch and implement PR feedback

After creating a PR, fetch its outstanding conversation comments and unresolved
review threads with:

```sh
/home/george/scripts/github-agent-workflow.sh - quick-quinielas <pr-number>
```

The result contains the PR `state`, top-level `conversation` comments, and
unresolved inline `reviewThreads`. Bot comments, resolved threads, and comments
that already have reactions are omitted by default.

For each actionable comment:

1. Work in the existing issue worktree and branch; do not create another PR.
2. Inspect the referenced code and implement the requested behavior precisely.
3. Run focused validation, then the full available checks.
4. Review the incremental diff against both the comment and repository
   standards.
5. Commit the follow-up and push it to update the existing PR.

```sh
cd /home/george/code/quick-quinielas-<issue-number>
git add <changed-files>
git commit -m "fix: <short feedback description>"
git push
```

Run the PR-feedback command again whenever the user says new comments were
added. Treat the latest returned comments and unresolved threads as the current
requested changes.

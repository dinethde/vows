A real secret never enters the repository, a commit message, a pull request, a
test fixture or a log line. `.env.example` holds names with empty values.
Values come from the Bitwarden vault and are pushed to Vercel, Fly or GitHub
with the value read from the vault inline, so it is never displayed:
`fly secrets set X="$(bw get password vows-prod-x)"`.

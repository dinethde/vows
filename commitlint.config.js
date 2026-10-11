/** Chapter 23 of architecture.md. The word rules live in .claude/skills/writing-commits. */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 60],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'body-max-line-length': [2, 'always', 100],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'perf', 'docs', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    'scope-enum': [
      2,
      'always',
      ['web', 'api', 'worker', 'db', 'contracts', 'ui', 'tokens', 'mail', 'config', 'infra', 'ci', 'repo'],
    ],
  },
};

import * as v from 'valibot'

/**
 * A remote's address: `https://host/owner/repo` or `git@host:owner/repo`. Nothing else reaches the
 * command line, so an address can never be read as an option or name another transport.
 */
export const RemoteURL = v.pipe(
  v.string(),
  v.trim(),
  v.maxLength(2000),
  v.regex(
    /^(?:https:\/\/[\w.-]+(?::\d+)?\/[\w.~/-]+|git@[\w.-]+:[\w.~/-]+)$/,
    'Expected an https:// or git@ repository address'
  )
)

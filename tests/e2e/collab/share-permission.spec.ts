import { expect, test } from '@playwright/test'

import { collaborationErrors, createPeer, share, startRelay } from '#tests/helpers/collab/room'

test('the share panel says who can edit before and after a live link is shared', async ({
  browser
}) => {
  const relay = await startRelay()
  const peer = await createPeer(browser, 'Host', relay.url)
  try {
    const popover = peer.page.getByTestId('collab-popover')
    await peer.page.getByTestId('collab-share-button').click()
    await expect(popover.getByTestId('collab-share-file')).toBeVisible()
    await expect(popover.getByTestId('collab-share-permission')).toHaveAttribute(
      'data-permission',
      'edit'
    )
    await peer.page.keyboard.press('Escape')

    await share(peer)
    await peer.page.getByTestId('collab-share-button').click()
    await expect(popover.getByTestId('collab-room-link')).toBeVisible()
    await expect(popover.getByTestId('collab-share-permission')).toHaveAttribute(
      'data-permission',
      'edit'
    )
    expect(collaborationErrors(peer)).toEqual([])
  } finally {
    await peer.context.close()
    await relay.close()
  }
})

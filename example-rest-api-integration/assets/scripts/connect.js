/**
 * This function starts and manages the authorization flow.
 * First it will open a popup with the authorization url.
 * Then, it will listen for postmessages coming from the popup window.
 * If the response is a successful connection  it will close the opneded popup and reload the page.
 */
function startAuthorizationFlow(connectButton) {
  connectButton.disabled = true;

  const popup = window.open('/oauth2/authorize', '_blank');

  if (popup == null) {
    alert(
      'Your browser blocked the popup. Please enable allow popups for this page.',
    );
    connectButton.disabled = false;
    return;
  }

  /**
   * This catch the case where the user closes the popup window
   */
  const closedPopupInterval = setInterval(() => {
    if (!popup || popup.closed) {
      connectButton.disabled = false;

      // Cleanup
      clearInterval(closedPopupInterval);
    }
  }, 1000);

  const postMessageListener = window.addEventListener('message', (event) => {
    if (event.source === popup) {
      if (event.data === 'Success') {
        window.location.reload();
      } else {
        console.error(`Something went wrong, got ${event.data} back`);
      }

      // Cleanup
      clearInterval(closedPopupInterval);
      window.removeEventListener('message', postMessageListener);
      popup.close();
    }
  });
}

window.addEventListener(
  'load',
  () => {
    const connectButton = document.getElementById('connect-button');

    connectButton.addEventListener(
      'click',
      () => {
        startAuthorizationFlow(connectButton);
      },
      false,
    );
  },
  false,
);

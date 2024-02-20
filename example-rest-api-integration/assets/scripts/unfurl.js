async function startUnfurling(event) {
  event.preventDefault();
  const link = document.getElementById('documentLink').value;
  const response = await window.fetch(`/api/directEmbed?documentLink=${link}`, {
    method: 'get',
    headers: { Accept: 'application/json' },
  });

  if (response.ok) {
    const jsonResult = await response.json();
    const maybeIframe = document.getElementById('unfurlIframe');
    if (!maybeIframe) {
      var iframe = document.createElement('iframe');
      iframe.id = 'unfurlIframe';
      iframe.width = '600px';
      iframe.height = '800px';
      iframe.setAttribute('src', jsonResult.link);
      document.getElementById('unfurl-example').appendChild(iframe);
    } else {
      maybeIframe.setAttribute('src', jsonResult.link);
    }
  }
}

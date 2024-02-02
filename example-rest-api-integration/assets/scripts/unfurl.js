async function startUnfurling(event) {
  event.preventDefault();
  const link = document.getElementById('documentLink').value;
  const response = await window.fetch(`/api/directEmbed?documentLink=${link}`, {
    method: 'get',
    headers: { Accept: 'application/json' },
  });

  if (response.ok) {
    const jsonResult = await response.json();

    var iframe = document.createElement('iframe');
    iframe.width = '600px';
    iframe.height = '800px';
    iframe.setAttribute('src', jsonResult.link);
    document.getElementById('unfurl-example').appendChild(iframe);
  }
}

const form = document.querySelector('#quote-form');
const panel = document.querySelector('#draft');
const service = form.elements.service;
const requested = new URLSearchParams(location.search).get('service');
if ([...service.options].some(option => option.value === requested)) service.value = requested;
form.hidden = false;

form.addEventListener('input', () => { panel.hidden = true });
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get('name').trim();
  const brief = data.get('brief').trim();
  if (!name || !brief) {
    const control = name ? form.elements.brief : form.elements.name;
    control.setCustomValidity('Please enter a little detail here.');
    control.reportValidity();
    control.addEventListener('input', () => control.setCustomValidity(''), {once:true});
    return;
  }
  const category = service.selectedOptions[0].textContent;
  const body = [
    'Hello Project Z,', '', brief, '', 'Service: ' + category,
    ...(data.get('timing').trim() ? ['Target date: ' + data.get('timing').trim()] : []),
    ...(data.get('budget').trim() ? ['Budget range: ' + data.get('budget').trim()] : []),
    '', name, data.get('email').trim()
  ].join('\n');
  const subject = 'Project enquiry — ' + category;
  const recipient = document.querySelector('.contact-form .direct').getAttribute('href');
  panel.querySelector('pre').textContent = body;
  document.querySelector('#send').href = recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  document.querySelector('#copy-status').textContent = '';
  panel.hidden = false;
  panel.focus();
});
document.querySelector('#copy').addEventListener('click', async () => {
  const pre = panel.querySelector('pre');
  let message = 'Brief copied.';
  try { await navigator.clipboard.writeText(pre.textContent) }
  catch {
    const range = document.createRange();
    range.selectNodeContents(pre);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    message = 'Brief selected. Use your device’s Copy command.';
  }
  document.querySelector('#copy-status').textContent = message;
});

/* Interacciones locales para el material de Sistemas Operativos. */
(function () {
  'use strict';
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  var toggle = document.querySelector('[data-projection]');
  function setProjection(value) {
    document.body.classList.toggle('projection', value);
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(value));
      toggle.querySelector('span').textContent = value ? 'Proyección activa' : 'Proyección';
    }
    try { localStorage.setItem('so-projection', String(value)); } catch (error) { /* Preferencia opcional. */ }
  }
  try { setProjection(localStorage.getItem('so-projection') === 'true'); } catch (error) {}
  if (toggle) toggle.addEventListener('click', function () { setProjection(!document.body.classList.contains('projection')); });
  var carousel = document.querySelector('.topic-carousel');
  if (carousel) {
    var active = carousel.querySelector('[aria-current="page"]');
    if (active) carousel.scrollLeft = Math.max(0, active.offsetLeft - carousel.offsetLeft - carousel.clientWidth / 2 + active.clientWidth / 2);
    var back = document.querySelector('[data-carousel-back]');
    var next = document.querySelector('[data-carousel-next]');
    function updateCarousel() {
      back.disabled = carousel.scrollLeft < 4;
      next.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 4;
    }
    back.addEventListener('click', function () { carousel.scrollBy({left: -carousel.clientWidth * .65, behavior: motion}); });
    next.addEventListener('click', function () { carousel.scrollBy({left: carousel.clientWidth * .65, behavior: motion}); });
    carousel.addEventListener('scroll', updateCarousel, {passive:true});
    window.addEventListener('resize', updateCarousel);
    updateCarousel();
  }
  var progress = document.querySelector('[data-reading-progress]');
  if (progress) {
    function updateProgress() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? Math.min(100, 100 * window.scrollY / max) : 0) + '%';
    }
    window.addEventListener('scroll', updateProgress, {passive:true});
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }
  var matrixLab = document.querySelector('[data-matrix-lab]');
  if (matrixLab) {
    var base = [
      ['R','RW','','X'],
      ['RW','R','RW','X'],
      ['R','','R','']
    ];
    var rights = base.map(function (row) { return row.slice(); });
    var subject = document.getElementById('matrix-subject');
    var object = document.getElementById('matrix-object');
    var action = document.getElementById('matrix-action');
    var result = document.getElementById('matrix-result');
    var change = document.getElementById('matrix-change');
    var subjects = ['Estudiante','Docente','Coordinación'];
    var objects = ['Material.pdf','Entrega.txt','Calificaciones.csv','Simulador'];
    var actionNames = {R:'leer',W:'escribir en',X:'ejecutar'};
    function updateMatrix() {
      var s = Number(subject.value), o = Number(object.value), a = action.value;
      matrixLab.querySelectorAll('[data-cell]').forEach(function (cell) {
        var pair = cell.dataset.cell.split(',').map(Number);
        cell.textContent = rights[pair[0]][pair[1]] || '—';
        cell.classList.toggle('selected-cell', pair[0] === s && pair[1] === o);
      });
      var allowed = rights[s][o].includes(a);
      result.dataset.state = allowed ? 'allow' : 'deny';
      result.replaceChildren();
      var title = document.createElement('strong');
      title.textContent = allowed ? 'Acceso permitido' : 'Acceso denegado';
      var description = document.createElement('span');
      description.textContent = subjects[s] + ' solicita ' + actionNames[a] + ' ' + objects[o] + '. ' + (rights[s][o] ? 'La celda contiene ' + rights[s][o] : 'La celda está vacía') + '; ' + (allowed ? 'incluye ' : 'no incluye ') + a + '.';
      result.append(title, description);
      change.textContent = allowed ? 'Revocar permiso' : 'Conceder permiso';
    }
    [subject,object,action].forEach(function (select) { select.addEventListener('change', updateMatrix); });
    change.addEventListener('click', function () {
      var s = Number(subject.value), o = Number(object.value), a = action.value;
      rights[s][o] = rights[s][o].includes(a) ? rights[s][o].replace(a,'') : ['R','W','X'].filter(function (r) { return r === a || rights[s][o].includes(r); }).join('');
      updateMatrix();
    });
    document.getElementById('matrix-reset').addEventListener('click', function () {
      rights = base.map(function (row) { return row.slice(); });
      subject.value = '0'; object.value = '2'; action.value = 'W';
      updateMatrix();
    });
    updateMatrix();
  }
  var validationForm = document.getElementById('validation-form');
  if (validationForm) {
    validationForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var raw = document.getElementById('grade-value').value.trim();
      var grade = Number(raw);
      var valid = raw !== '' && Number.isFinite(grade) && grade >= 0 && grade <= 100;
      var target = document.getElementById('validation-result');
      target.dataset.state = valid ? 'allow' : 'deny';
      target.querySelector('strong').textContent = valid ? 'Dato válido' : 'Dato rechazado';
      target.querySelector('span').textContent = valid ? 'Cumple el tipo numérico y el rango de 0 a 100. Todavía debe comprobarse que el usuario tenga permiso para registrar la calificación.' : 'Introduce una calificación numérica entre 0 y 100. La validación detecta un dato fuera de la regla, incluso si el usuario inició sesión.';
    });
  }
  var cryptoLab = document.querySelector('[data-crypto-lab]');
  if (cryptoLab) {
    var message = document.getElementById('crypto-message');
    var encryptButton = document.getElementById('crypto-encrypt');
    var decryptButton = document.getElementById('crypto-decrypt');
    var tamperButton = document.getElementById('crypto-tamper');
    var cipherOutput = document.getElementById('crypto-cipher');
    var plainOutput = document.getElementById('crypto-plain');
    var cryptoStatus = document.getElementById('crypto-status');
    var encoder = new TextEncoder();
    var decoder = new TextDecoder();
    var key = null, iv = null, encrypted = null, busy = false, tampered = false;
    function status(title, text, state) {
      cryptoStatus.dataset.state = state || '';
      cryptoStatus.querySelector('strong').textContent = title;
      cryptoStatus.querySelector('span').textContent = text;
    }
    function controls() {
      encryptButton.disabled = busy;
      decryptButton.disabled = busy || !encrypted;
      tamperButton.disabled = busy || !encrypted || tampered;
    }
    function base64(bytes) { return btoa(String.fromCharCode.apply(null, new Uint8Array(bytes))); }
    if (!window.isSecureContext || !window.crypto || !window.crypto.subtle) {
      encryptButton.disabled = true;
      status('Demostración no disponible', 'Esta demostración necesita Web Crypto en una conexión segura (HTTPS) o en localhost. Puedes seguir el esquema y los ejemplos de esta página.', 'deny');
    } else {
      encryptButton.addEventListener('click', async function () {
        if (busy) return;
        if (!message.value.trim()) { status('Escribe un mensaje', 'Elige un texto breve para observar cómo cambia al cifrarlo.', 'deny'); return; }
        busy = true; controls();
        try {
          if (!key) key = await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
          iv = crypto.getRandomValues(new Uint8Array(12));
          encrypted = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},key,encoder.encode(message.value)));
          tampered = false;
          cipherOutput.textContent = base64(encrypted);
          plainOutput.textContent = 'Pulsa “Descifrar” para recuperar el mensaje.';
          status('Mensaje cifrado con AES-GCM', 'Se usó una clave de 256 bits y un IV aleatorio nuevo. El bloque mostrado incluye la etiqueta de autenticación; Base64 solo lo representa como texto.', 'allow');
        } catch (error) {
          encrypted = null;
          status('No se pudo cifrar', 'El navegador no completó la operación. Vuelve a intentarlo.', 'deny');
        } finally { busy = false; controls(); }
      });
      decryptButton.addEventListener('click', async function () {
        if (!encrypted || busy) return;
        busy = true; controls();
        try {
          var recovered = await crypto.subtle.decrypt({name:'AES-GCM',iv:iv},key,encrypted);
          plainOutput.textContent = decoder.decode(recovered);
          status('Mensaje recuperado', 'La clave correcta permite descifrar y la etiqueta de autenticación verifica la integridad del bloque.', 'allow');
        } catch (error) {
          plainOutput.textContent = 'No se entrega texto descifrado.';
          status('Verificación fallida', 'El bloque fue alterado o los parámetros no corresponden. AES-GCM rechaza el mensaje.', 'deny');
        } finally { busy = false; controls(); }
      });
      tamperButton.addEventListener('click', async function () {
        if (!encrypted || busy || tampered) return;
        busy = true;
        tampered = true;
        controls();
        encrypted = encrypted.slice();
        encrypted[0] ^= 1;
        cipherOutput.textContent = base64(encrypted);
        try {
          await crypto.subtle.decrypt({name:'AES-GCM',iv:iv},key,encrypted);
          status('Vuelve a cifrar', 'Genera un nuevo bloque para repetir la demostración.', '');
        } catch (error) {
          plainOutput.textContent = 'No se entrega texto descifrado.';
          status('Alteración detectada', 'Se cambió un bit del bloque. La autenticación falla y el descifrado se rechaza. Cifra de nuevo para restaurar un bloque válido.', 'deny');
        } finally { busy = false; controls(); }
      });
    }
  }
}());

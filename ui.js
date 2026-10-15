// Interfaz: idioma, tema, validación de entrada y copiado.
// No modifica los comandos de script.js: envuelve generateShell() y copyToClipboard().
(function () {
    const $ = (id) => document.getElementById(id);
    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    };

    const I18N = {
        es: {
            brandSub: 'UN FANTASMA EN EL SISTEMA', lang: 'EN', themeLight: '☀ CLARO', themeDark: '☾ OSCURO',
            title: 'Generador de Reverse Shells',
            lead: 'Introduce la IP y el puerto de tu máquina de escucha para generar el comando.',
            warning: '⚠ Solo para laboratorios, CTF y auditorías con autorización por escrito.',
            ipLabel: 'Dirección IP de escucha', portLabel: 'Puerto de escucha',
            ncFifo: 'Netcat (mkfifo, sin -e)', ncE: 'Netcat tradicional (-e)', psDl: 'PowerShell (descarga shell.ps1)',
            outLabel: 'Comando generado', copy: 'Copiar comando', copied: 'Comando copiado al portapapeles.',
            copyFail: 'No se pudo copiar automáticamente: selecciona el texto y cópialo a mano.', nothing: 'Primero genera un comando.',
            footer: 'Material educativo. Usarlo contra sistemas sin permiso es delito.', source: 'Código fuente',
            ipEmpty: 'Escribe una IP o un nombre de host.',
            ipBad: 'IP o host no válido: usa una IPv4 (10.10.14.3) o un nombre de host, sin espacios ni comillas.',
            portBad: 'El puerto debe ser un número entre 1 y 65535.',
            notes: {
                'nc-openbsd': 'Requiere un netcat con la opción -e (netcat-traditional). La versión OpenBSD, la que traen muchas distribuciones, no la tiene: en ese caso usa la variante mkfifo.',
                'netcat': 'Variante que funciona con netcat-openbsd, sin la opción -e.',
                'powershell': 'Esta opción no conecta directamente: descarga y ejecuta un script shell.ps1 que tienes que servir por HTTP (puerto 80) desde tu IP. El puerto de escucha no se usa en este comando.'
            }
        },
        en: {
            brandSub: 'A GHOST IN THE SYSTEM', lang: 'ES', themeLight: '☀ LIGHT', themeDark: '☾ DARK',
            title: 'Reverse Shell Generator',
            lead: 'Enter the IP and port of your listening machine to generate the command.',
            warning: '⚠ Only for labs, CTFs and engagements with written authorisation.',
            ipLabel: 'Listening IP address', portLabel: 'Listening port',
            ncFifo: 'Netcat (mkfifo, no -e)', ncE: 'Traditional netcat (-e)', psDl: 'PowerShell (downloads shell.ps1)',
            outLabel: 'Generated command', copy: 'Copy command', copied: 'Command copied to the clipboard.',
            copyFail: 'Could not copy automatically: select the text and copy it by hand.', nothing: 'Generate a command first.',
            footer: 'Educational material. Using it against systems without permission is a crime.', source: 'Source code',
            ipEmpty: 'Enter an IP address or a host name.',
            ipBad: 'Invalid IP or host: use an IPv4 address (10.10.14.3) or a host name, with no spaces or quotes.',
            portBad: 'The port must be a number between 1 and 65535.',
            notes: {
                'nc-openbsd': 'Needs a netcat build with the -e option (netcat-traditional). The OpenBSD build, shipped by many distributions, lacks it: use the mkfifo variant instead.',
                'netcat': 'Variant that works with netcat-openbsd, without the -e option.',
                'powershell': 'This option does not connect directly: it downloads and runs a shell.ps1 script you must serve over HTTP (port 80) from your IP. The listening port is not used in this command.'
            }
        }
    };

    let LANG = store.get('rsg_lang') || ((navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en');
    let current = null;
    const T = () => I18N[LANG];

    function applyTheme(t) {
        document.documentElement.setAttribute('data-theme', t);
        $('themeBtn').textContent = t === 'light' ? T().themeDark : T().themeLight;
    }
    function applyTexts() {
        document.documentElement.lang = LANG;
        document.querySelectorAll('[data-t]').forEach(el => { if (typeof T()[el.dataset.t] === 'string') el.textContent = T()[el.dataset.t]; });
        $('langBtn').textContent = T().lang;
        applyTheme(document.documentElement.getAttribute('data-theme'));
        showNote();
    }

    // ---------- validación ----------
    const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    const HOST = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;

    function fieldError(input, box, msg) {
        input.classList.toggle('invalid', !!msg);
        box.textContent = msg || '';
        box.hidden = !msg;
    }
    function validate() {
        const ipEl = $('attackerIP'), portEl = $('attackerPort');
        const ip = ipEl.value.trim(), port = portEl.value.trim();
        ipEl.value = ip;
        let ok = true;
        if (!ip) { fieldError(ipEl, $('ipError'), T().ipEmpty); ok = false; }
        else if (!(IPV4.test(ip) || (HOST.test(ip) && !/^[\d.]+$/.test(ip)))) { fieldError(ipEl, $('ipError'), T().ipBad); ok = false; }
        else fieldError(ipEl, $('ipError'), '');
        const n = Number(port);
        if (!/^\d+$/.test(port) || n < 1 || n > 65535) { fieldError(portEl, $('portError'), T().portBad); ok = false; }
        else { portEl.value = String(n); fieldError(portEl, $('portError'), ''); }
        return ok;
    }

    function status(kind, msg) {
        const s = $('status');
        s.className = 'status ' + (kind || '');
        s.textContent = msg || '';
    }
    function showNote() {
        const note = current && T().notes[current];
        $('shellNote').textContent = note || '';
        $('shellNote').hidden = !note;
        const btn = current && document.querySelector(`[data-shell="${current}"]`);
        $('shellName').textContent = btn ? btn.textContent : '';
    }

    // ---------- envoltorios sobre script.js ----------
    const originalGenerate = window.generateShell;
    window.generateShell = function (type) {
        status();
        if (!validate()) { $('outputShell').value = ''; current = null; showNote(); markActive(); return; }
        current = type;
        originalGenerate(type);
        markActive();
        showNote();
    };
    window.copyToClipboard = async function () {
        const text = $('outputShell').value;
        if (!text) return status('bad', T().nothing);
        try { await navigator.clipboard.writeText(text); status('ok', T().copied); }
        catch (e) { $('outputShell').select(); status('bad', T().copyFail); }
    };
    function markActive() {
        document.querySelectorAll('[data-shell]').forEach(b => b.classList.toggle('on', b.dataset.shell === current));
    }

    // ---------- eventos ----------
    document.querySelectorAll('[data-shell]').forEach(b => b.addEventListener('click', () => window.generateShell(b.dataset.shell)));
    $('copyBtn').addEventListener('click', () => window.copyToClipboard());
    ['attackerIP', 'attackerPort'].forEach(id => $(id).addEventListener('input', () => {
        if (current && validate()) originalGenerate(current);
    }));
    $('langBtn').addEventListener('click', () => {
        LANG = LANG === 'es' ? 'en' : 'es'; store.set('rsg_lang', LANG);
        applyTexts();
        if ($('ipError').textContent || $('portError').textContent) validate();
    });
    $('themeBtn').addEventListener('click', () => {
        const t = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        store.set('rsg_theme', t); applyTheme(t);
    });

    applyTexts();
})();

# Reverse Shell Generator

Generador de comandos de *reverse shell* para **laboratorios, CTF y auditorías autorizadas**, de [Un Fantasma en el Sistema](https://www.unfantasmaenelsistema.com).

▶ **Abrir:** https://unfantasmaenelsistema.github.io/ReverseShellGenerator/

> ⚠️ **Uso responsable.** Esta herramienta es material educativo para practicar en entornos propios o con autorización por escrito (laboratorios, máquinas de CTF, pentests con contrato). Usarla contra sistemas ajenos sin permiso es delito (en España, entre otros, arts. 197 bis y 264 del Código Penal).

## Cómo se usa

1. Escribe la IP y el puerto de la máquina donde vas a escuchar.
2. Elige el lenguaje o la herramienta disponible en el sistema de laboratorio.
3. Copia el comando generado.

Variantes disponibles: Bash, Python, Netcat (mkfifo, sin `-e`), Netcat tradicional (`-e`), PHP, Perl, Ruby y PowerShell (descarga de `shell.ps1`).

## Notas

- **Netcat:** la versión OpenBSD (la habitual en Debian, Ubuntu o Kali) no tiene la opción `-e`; para ella está la variante *mkfifo*. La variante `-e` solo funciona con *netcat-traditional*.
- **PowerShell:** esta opción no conecta directamente: descarga y ejecuta un `shell.ps1` que tienes que servir por HTTP (puerto 80) desde tu IP, así que el puerto de escucha no se usa.
- La IP y el puerto se validan (IPv4 o nombre de host, puerto 1–65535) para no generar comandos rotos.
- Todo funciona en el navegador; no se envía nada a ningún servidor.
- Español e inglés y tema claro/oscuro (se recuerdan entre visitas).

## Estructura

```
index.html   página
styles.css   estilos (claro/oscuro)
script.js    generación de los comandos
ui.js        idioma, tema, validación y copiado (envuelve script.js)
logo.png     logo
```

Para probar en local: `python -m http.server` y abrir `http://localhost:8000`.

## English

Reverse shell command generator for **labs, CTFs and authorised engagements only**. Enter your listener's IP and port, pick a language and copy the command. Inputs are validated, the UI is bilingual (ES/EN) with light/dark themes, and everything runs in the browser.

## Licencia / License

[MIT](LICENSE) © Un Fantasma en el Sistema

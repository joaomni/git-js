const readline = require('readline-sync')
const shell = require('shelljs')


readline.question("Comando git:")

shell.exec("git -v")
const readline = require('readline-sync')
const shell = require('shelljs')

function start(){

    const gitjs = {}

    gitjs.branchName = askAndReturnBranchName()
    
    function askAndReturnBranchName(){
        return readline.question("Escreva o nome da branch: ")
    }

    function createNewBranch(branch){
        console.log(`\nrun: git checkout -b "${branch}"`)

        shell.exec(`git checkout -b "${branch}"`)
    }

    createNewBranch(gitjs.branchName)

    function initNewCommit(){
        shell.exec("git status")
        shell.exec("\ngit add --all")

        const commitText = readline.question("Escreva seu comentario?: ")

        shell.exec(`git commit -m "${commitText}"`)

        shell.exec(`git push origin ${gitjs.branchName}`)
    }

    initNewCommit()
}

start()
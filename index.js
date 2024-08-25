const readline = require('readline-sync');
const shell = require('shelljs');

function start() {
    const gitjs = {};

    // Perguntar o tipo de commit usando keyInSelect
    gitjs.commitType = askAndReturnCommitType();
    gitjs.branchName = askAndReturnBranchName();

    function askAndReturnCommitType() {
        const types = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf'];
        const index = readline.keyInSelect(types, 'Escolha o tipo de commit:');

        if (index === -1) {
            console.log("Operação cancelada.");
            process.exit(1); // Sai do script se o usuário cancelar a escolha
        }

        return types[index];
    }

    function askAndReturnBranchName() {
        const name = readline.question("Escreva o nome da branch: ");
        return `${gitjs.commitType}/${name.replace(/\s+/g, '-').toLowerCase()}`;
    }

    function createNewBranch(branch) {
        console.log(`\nExecutando: git checkout -b "${branch}"`);
        shell.exec(`git checkout -b "${branch}"`);
    }

    createNewBranch(gitjs.branchName);

    function initNewCommit() {
        shell.exec("git status");
        shell.exec("\ngit add --all");

        const commitMessage = readline.question("Escreva seu comentário: ");
        shell.exec(`git commit -m "${gitjs.commitType}: ${commitMessage}"`);
        shell.exec(`git push origin ${gitjs.branchName}`);
    }

    initNewCommit();
}

start();

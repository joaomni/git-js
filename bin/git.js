#!/usr/bin/env node

const readlineSync = require('readline-sync');
const shell = require('shelljs');
const process = require('process');

function start() {
    const gitjs = {};

    // Definir emojis e descrições para cada tipo de commit
    const commitTypes = {
        feat: { emoji: '✨', description: 'A new feature' },
        fix: { emoji: '🐛', description: 'A bug fix' },
        docs: { emoji: '📚', description: 'Documentation only changes' },
        style: { emoji: '💎', description: 'Styles (no code change)' },
        refactor: { emoji: '📦', description: 'Code refactoring' },
        perf: { emoji: '🚀', description: 'Performance improvements' },
        test: { emoji: '🚨', description: 'Tests' },
        build: { emoji: '🛠', description: 'Builds' },
        ci: { emoji: '⚙️', description: 'CI configuration' },
        chore: { emoji: '♻️', description: 'Chores' },
        revert: { emoji: '🗑', description: 'Reverts' }
    };

    // Perguntar o tipo de commit
    gitjs.commitType = askAndReturnCommitType(commitTypes);
    // Perguntar o escopo do commit
    gitjs.scope = askAndReturnScope();
    // Perguntar o nome da branch
    gitjs.branchName = askAndReturnBranchName();

    function askAndReturnCommitType(commitTypes) {
        const types = Object.keys(commitTypes);
        const choices = types.map(type => `${commitTypes[type].emoji} ${type} - ${commitTypes[type].description}`);
        const index = readlineSync.keyInSelect(choices, 'Escolha o tipo de commit:');

        if (index === -1) {
            console.log("Operação cancelada.");
            process.exit(1); // Sai do script se o usuário cancelar a escolha
        }

        return `${commitTypes[types[index]].emoji} ${types[index]}`;
    }

    function askAndReturnScope() {
        const scope = readlineSync.question("Digite o escopo do commit (ou deixe vazio para nenhum escopo): ");
        return scope ? `(${scope})` : '';
    }

    function askAndReturnBranchName() {
        const name = readlineSync.question("Escreva o nome da branch: ");
        return `${gitjs.commitType.split(' ')[1]}/${name.replace(/\s+/g, '-').toLowerCase()}`;
    }

    function createNewBranch(branch) {
        console.log(`\nExecutando: git checkout -b "${branch}"`);
        if (shell.exec(`git checkout -b "${branch}"`).code !== 0) {
            console.error('Erro ao criar a branch.');
            process.exit(1);
        }
    }

    createNewBranch(gitjs.branchName);

    function initNewCommit() {
        if (shell.exec("git status").code !== 0) {
            console.error('Erro ao executar git status.');
            process.exit(1);
        }
        shell.exec("git add --all");

        const commitMessage = readlineSync.question("Escreva seu comentário: ");
        const formattedMessage = `${gitjs.commitType}${gitjs.scope}: ${commitMessage}`;
        if (shell.exec(`git commit -m "${formattedMessage}"`).code !== 0) {
            console.error('Erro ao fazer o commit.');
            process.exit(1);
        }

        if (shell.exec(`git push origin ${gitjs.branchName}`).code !== 0) {
            console.error('Erro ao fazer o push.');
            process.exit(1);
        }
    }

    initNewCommit();
}

start();

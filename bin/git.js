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
        const command = `git checkout -b "${branch}"`;
        console.log(`\nExecutando: ${command}`);
        const result = shell.exec(command);
        if (result.code === 0) {
            console.log('Branch criada com sucesso:', branch);
        } else {
            console.error('Erro ao criar a branch.');
            process.exit(1);
        }
    }

    createNewBranch(gitjs.branchName);

    function initNewCommit() {
        const statusCommand = "git status";
        console.log(`\nExecutando: ${statusCommand}`);
        const statusResult = shell.exec(statusCommand);
        if (statusResult.code !== 0) {
            console.error('Erro ao executar git status.');
            process.exit(1);
        }

        const addCommand = "git add --all";
        console.log(`Executando: ${addCommand}`);
        const addResult = shell.exec(addCommand);
        if (addResult.code !== 0) {
            console.error('Erro ao adicionar arquivos.');
            process.exit(1);
        }

        const commitMessage = readlineSync.question("Escreva seu comentário: ");
        const formattedMessage = `${gitjs.commitType}${gitjs.scope}: ${commitMessage}`;
        const commitCommand = `git commit -m "${formattedMessage}"`;
        console.log(`Executando: ${commitCommand}`);
        const commitResult = shell.exec(commitCommand);
        if (commitResult.code === 0) {
            console.log('Commit realizado com sucesso:', formattedMessage);
        } else {
            console.error('Erro ao fazer o commit.');
            process.exit(1);
        }

        const pushCommand = `git push origin ${gitjs.branchName}`;
        console.log(`Executando: ${pushCommand}`);
        const pushResult = shell.exec(pushCommand);
        if (pushResult.code === 0) {
            console.log('Push realizado com sucesso.');
        } else {
            console.error('Erro ao fazer o push.');
            process.exit(1);
        }
    }

    initNewCommit();
}

start();

#!/usr/bin/env ts-node
import readlineSync from 'readline-sync';
import shell from 'shelljs';
import chalk from 'chalk';

async function createCommit() {
    const gitjs = {
        commitType: '',
        scope: '',
        branchName: ''
    };

    // Definir emojis e descrições para cada tipo de commit
    const commitTypes = {
        feat: { emoji: '\u{2728}', description: 'A new feature' },
        fix: { emoji: '\u{1F41B}', description: 'A bug fix' },
        docs: { emoji: '\u{1F4DA}', description: 'Documentation only changes' },
        style: { emoji: '\u{1F48E}', description: 'Styles (no code change)' },
        refactor: { emoji: '\u{1F4E6}', description: 'Code refactoring' },
        perf: { emoji: '\u{1F680}', description: 'Performance improvements' },
        test: { emoji: '\u{1F6A8}', description: 'Tests' },
        build: { emoji: '\u{1F6E0}', description: 'Builds' },
        ci: { emoji: '\u{2699}', description: 'CI configuration' },
        chore: { emoji: '\u{267B}', description: 'Chores' },
        revert: { emoji: '\u{1F5D1}', description: 'Reverts' },
    };

    // Perguntar o tipo de commit
    gitjs.commitType = askAndReturnCommitType(commitTypes);
    // Perguntar o escopo do commit
    gitjs.scope = askAndReturnScope();
    // Perguntar o nome da branch
    gitjs.branchName = await askAndReturnBranchName();
    
    function askAndReturnCommitType(commitTypes) {
        const types = Object.keys(commitTypes);
        const choices = types.map((type) => `${commitTypes[type].emoji} ${type} - ${commitTypes[type].description}`);
        const index = readlineSync.keyInSelect(choices, 'Escolha o tipo de commit:');
        if (index === -1) {
            console.log(chalk.red('Operação cancelada.'));
            process.exit(1); // Sai do script se o usuário cancelar a escolha
        }
        return `${commitTypes[types[index]].emoji} ${types[index]}`;
    }
    
    function askAndReturnScope() {
        const scope = readlineSync.question('Digite o escopo do commit (ou deixe vazio para nenhum escopo): ');
        return scope ? `(${scope})` : '';
    }
    
    async function askAndReturnBranchName() {
        const branchList = getBranchList();
        const newBranchOption = 'Criar uma nova branch';
        const choices = [...branchList, newBranchOption];
        const index = readlineSync.keyInSelect(choices, 'Escolha uma branch existente ou crie uma nova:');
        if (index === -1) {
            console.log(chalk.red('Operação cancelada.'));
            process.exit(1); // Sai do script se o usuário cancelar a escolha
        }
        if (choices[index] === newBranchOption) {
            const name = readlineSync.question('Escreva o nome da nova branch: ');
            return `${gitjs.commitType.split(' ')[1]}/${name
                .replace(/\s+/g, '-')
                .toLowerCase()}`;
        }
        return choices[index];
    }

    function getBranchList() {
        const command = 'git for-each-ref --sort=-creatordate --format "%(refname:short)" refs/heads/ | head -n 10';
        const result = shell.exec(command, { silent: true });
        if (result.code !== 0) {
            console.error(chalk.red('Erro ao listar branches.'));
            process.exit(1);
        }
        return result.stdout.trim().split('\n');
    }

    function createNewBranch(branch) {
        const command = `git checkout -b "${branch}"`;
        console.log(chalk.cyan(`\n--- Executando: ${command} ---\n`));
        const result = shell.exec(command);
        if (result.code === 0) {
            console.log(chalk.green('Branch criada com sucesso:', branch));
        }
        else {
            console.error(chalk.red('Erro ao criar a branch.'));
            process.exit(1);
        }
    }

    // Verifica se a branch já existe e faz checkout nela se existir
    if (!shell.exec(`git rev-parse --verify ${gitjs.branchName}`, { silent: true }).code) {
        console.log(chalk.cyan(`\n--- Branch já existe, trocando para ${gitjs.branchName} ---\n`));
        shell.exec(`git checkout ${gitjs.branchName}`);
    } else {
        createNewBranch(gitjs.branchName);
    }
    
    function initNewCommit() {
        const statusCommand = 'git status';
        console.log(chalk.cyan(`\n--- Executando: ${statusCommand} ---\n`));
        const statusResult = shell.exec(statusCommand);
        if (statusResult.code !== 0) {
            console.error(chalk.red('Erro ao executar git status.'));
            process.exit(1);
        }
        const addCommand = 'git add --all';
        console.log(chalk.cyan(`\n--- Executando: ${addCommand} ---\n`));
        const addResult = shell.exec(addCommand);
        if (addResult.code !== 0) {
            console.error(chalk.red('Erro ao adicionar arquivos.'));
            process.exit(1);
        }
        const commitMessage = readlineSync.question('Escreva seu comentário: ');
        const formattedMessage = `${gitjs.commitType}${gitjs.scope}: ${commitMessage}`;
        const commitCommand = `git commit -m "${formattedMessage}"`;
        console.log(chalk.cyan(`\n--- Executando: ${commitCommand} ---\n`));
        const commitResult = shell.exec(commitCommand);
        if (commitResult.code === 0) {
            console.log(chalk.green('Commit realizado com sucesso:', formattedMessage));
        }
        else {
            console.error(chalk.red('Erro ao fazer o commit.'));
            process.exit(1);
        }
        const pushCommand = `git push origin ${gitjs.branchName}`;
        console.log(chalk.cyan(`\n--- Executando: ${pushCommand} ---\n`));
        const pushResult = shell.exec(pushCommand);
        if (pushResult.code === 0) {
            console.log(chalk.green('Push realizado com sucesso.'));
        }
        else {
            console.error(chalk.red('Erro ao fazer o push.'));
            process.exit(1);
        }
    }
    initNewCommit();
}

createCommit();
export default createCommit;

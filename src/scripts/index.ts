/**
 * By: Lucas Viana Vilela
 * https://github.com/lucasvianav
 */

import { app, bixosDB, masterSheet, ss, ui, veteranosDB } from './globals';

const ALLOWED_EMAIL = 'sasel@eesc.usp.br';
const SIGNATURE =
  '\n<span><br>--<br>SA-SEL - Secretaria Acadêmica da Engenharia Elétrica<br>Departamento de Engenharia Elétrica e Computação<br>Escola de Engenharia de São Carlos</span>';

const emailBody =
  ss
    .getNamedRanges()
    .find(e => e.getName() === 'emailBody')
    .getRange()
    .getValue() + SIGNATURE;

const emailSubject = ss
  .getNamedRanges()
  .find(e => e.getName() === 'emailTitle')
  .getRange()
  .getValue();

const onOpen = () => {
  // Limpa a célula "searchedBixo"
  ss.getNamedRanges()
    .find(e => e.getName() === 'searchedBixo')
    .getRange()
    .clearContent();
  ui.createMenu('Como usar essa planilha?').addItem('Ler a documentação (RTFM)', 'displayHelp').addToUi();
  ui.createMenu('Scripts')
    .addItem('Sortear bixos', 'main')
    .addSeparator()
    .addSubMenu(
      ui
        .createMenu('Limpar planilhas')
        .addItem('"DB - Bixos" - toda', 'clearBixosDB')
        .addItem('"DB - Veteranos" - toda', 'clearVeteranosDB')
        .addItem('"Lista dos Meliantes" - linhas vazias', 'clearEmptyRowsMasterSheet')
        .addItem('"Lista dos Meliantes" - toda', 'clearMasterSheet'),
    )
    .addToUi();
};
// Algoritmo de Fisher-Yates para embaralhar um array
const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = array[i];

    array[i] = array[j];
    array[j] = tmp;
  }

  return array;
};
// Marca que o bixo na célula "searchedBixo" entrou no grupo
const enteredGroup = () => {
  const targetBixo = ss
    .getNamedRanges()
    .find(e => e.getName() === 'searchedBixo')
    .getRange()
    .getValue();

  if (!targetBixo) {
    ui.alert('Erro!', 'O bixo buscado é inválido.', ui.ButtonSet.OK);
  }
  masterSheet
    .createTextFinder(targetBixo)
    .findAll()
    .forEach(cur => masterSheet.getRange(`D${cur.getRow()}`).check());
};
// Mostra uma modal com o vídeo ensinando a usar a planilha e o
// link da pasta no drive aonde tem todos os vídeos do desenvolvimento
const displayHelp = () =>
  ui.showModalDialog(HtmlService.createHtmlOutputFromFile('help').setWidth(670).setHeight(870), 'Como usar a planilha?');
// Mostra uma modal com o email formatado a ser enviado pros padrinhos
const displayEmail = () => {
  const emailSubjectExample = getEmailSubject('Cleyton');
  const emailBodyExample = emailBody
    .replace('$(nomeVeteran@)', 'Cleyton')
    .replace('$(listarBixos)', '<li>Lucas Viana Vilela (Eletrônica)</li>\n<li>Felipe Marcelo José (Automação)</li>');

  ui.showModalDialog(HtmlService.createHtmlOutput(emailBodyExample).setWidth(600).setHeight(800), emailSubjectExample);
};
// Retorna lista com objetos {'name', 'emphashis'}
const getBixosDB = () => {
  // pega os dados dos bixos
  const bixos = bixosDB
    .getRange('A2:B')
    .getValues()
    .filter(b => b[0] || b[1])
    .map(b => ({ name: b[0], emphasis: b[1] }));

  // caso a lista de bixos esteja vazia
  if (!bixos.length) {
    ui.alert('Erro!', 'Não há nenhum dado na planilha "DB - Bixos".', ui.ButtonSet.OK);

    return null;
  }
  // checa se todos os bixos possuem dados válidos
  try {
    bixos.forEach(bixo => {
      // se algum bixo possuir um dado inválido, acusa um erro
      if (!bixo.name || !['Eletrônica', 'Automação'].includes(bixo.emphasis)) {
        throw new Error(
          'Ocorreu um erro com os dados dos bixos. Por favor, verifique se todos os bixos possuem uma ênfase especificada ("Eletrônica" x "Automação").',
        );
      }
    });
  } catch (e) {
    // caso algum erro tenha sido acusado ao pegar os dados dos bixos, alerta o usuário e retorna None
    ui.alert(
      'Erro!',
      'Ocorreu um erro com os dados dos bixos. Por favor, verifique se todos os bixos possuem uma ênfase especificada ("Eletrônica" x "Automação").',
      ui.ButtonSet.OK,
    );

    return null;
  }

  return bixos;
};
// Retorna lista embaralhada com objetos {'name', 'nickname', 'email', 'whatsapp', 'monobixo', 'emphasis'}
const getVeteranosDB = () => {
  // pega os dados dos veteranos
  const veteranos = veteranosDB
    .getRange('A2:F')
    .getValues()
    .filter(v => v.reduce((acc, cur) => acc || cur))
    .map(veterano => ({
      name: veterano[0],
      nickname: veterano[1],
      email: veterano[2],
      whatsapp: veterano[3],
      monobixo: veterano[4],
      emphasis: veterano[5],
    }));

  // caso a lista de veteranos esteja vazia
  if (!veteranos.length) {
    ui.alert('Erro!', 'Não há nenhum dado na planilha "DB - Veteranos".', ui.ButtonSet.OK);

    return null;
  }
  // checa se todos os veteranos possuem dados válidos
  try {
    veteranos.forEach(veterano => {
      // se algum veterano possuir um dado inválido, acusa um erro
      if (!veterano.name || !veterano.email || !['Eletrônica', 'Automação'].includes(veterano.emphasis)) {
        throw new Error(
          'Ocorreu um erro com os dados dos veteranos. Por favor, verifique se todos os veteranos possuem pelo menos nome, email e ênfase especificados ("Eletrônica" x "Automação").',
        );
      }
    });
  } catch (e) {
    // caso algum erro tenha sido acusado ao pegar os dados dos veteranos, alerta o usuário e retorna None
    ui.alert(
      'Erro!',
      'Ocorreu um erro com os dados dos veteranos. Por favor, verifique se todos os veteranos possuem pelo menos nome, email e ênfase especificados ("Eletrônica" x "Automação").',
      Button,
    );

    return null;
  }

  return shuffle(veteranos);
};
// Limpa todos os dados da planilha "DB - Bixos"
const clearBixosDB = () => bixosDB.getRange('A2:B').clearContent();
// Remove um bixo da planilha "DB - Bixos"
const removeBixoFromDB = (name, emphasis) => {
  const occurrences = bixosDB.createTextFinder(name).findAll();

  occurrences.forEach(o => {
    if (bixosDB.getRange(`B${o.getRow()}`).getValue() === emphasis) {
      bixosDB.deleteRow(o.getRow()).appendRow();
    }
  });
};
// Limpa todos os dados da planilha "DB - Veteranos"
const clearVeteranosDB = () => veteranosDB.getRange('A2:F').clearContent();
// Atribui veteranos a bixos
// Retorna lista com objetos {'name', 'emphashis', 'godparent', 'godparentEmail'}
const raffle = () => {
  const bixos = getBixosDB();
  // Faz a lista de veteranos filtrando os monobixo e que já receberam bixo
  // (se algum monobixo já tiver recebido bixo, mas o bixo tiver saído
  // da USP, ele vai receber um novo)
  const veteranos = getVeteranosDB().filter(veterano => {
    if (veterano.monobixo) {
      const occurrences = masterSheet.createTextFinder(veterano.name).findAll();

      for (const current of occurrences) {
        if (masterSheet.getRange(`E${current.getRow()}`).getValue() !== 'NÃO (saiu)') {
          return false;
        }
      }
    }

    return true;
  });

  if (!veteranos.length) {
    ui.alert(
      'Erro!',
      'Há apenas veteranos "monobixo" cadastrados e todos eles possuem um bixo atualmente, portanto não há padrinhos/madrinhas disponíveis.\n\nOBS: os "monobixos" são os veteranos que optaram por receber no máximo um único bixo.',
      ui.ButtonSet.OK,
    );

    return null;
  }

  // Mapeia um veterano para cada bixo
  return !bixos || !veteranos
    ? null
    : bixos.map((bixo, i) => {
        // i --> índice na lista dos bixos
        // j --> índice na lista dos veteranos
        let j = i;
        while (j >= veteranos.length) {
          j -= veteranos.length;
        }
        const godparent = { godparent: veteranos[j].name, godparentEmail: veteranos[j].email };

        if (veteranos[j].monobixo) {
          veteranos.splice(j, 1);
        }

        return { ...bixo, ...godparent };
      });
};
// Exclui todas as linhas vazias da planilha principal
const clearEmptyRowsMasterSheet = () => {
  const noRows = masterSheet.getMaxRows();
  const noCols = masterSheet.getMaxColumns();
  const emptyRows = [];

  for (let i = 1; i <= noRows; i++) {
    const isEmpty = !masterSheet
      .getRange(i, 1, 1, noCols)
      .getValues()[0]
      .reduce((acc, cur) => acc || cur);

    if (isEmpty) {
      emptyRows.push(i);
    }
  }
  emptyRows.forEach((i, qty) => {
    if (i > 2) {
      masterSheet.deleteRow(i - qty);
    }
  });
};
// Limpa todos os dados da planilha principal
const clearMasterSheet = () => {
  const r = ui.prompt(
    'Tem certeza que deseja continuar?',
    'Esse processo irá apagar >>TODOS<< os dados da planilha principal, "Lista dos Meliantes". Não será possível recuperá-los depois disso.',
    ui.ButtonSet.YES_NO,
  );

  if (r.getSelectedButton() === ui.Button.YES) {
    masterSheet.getRange('A2:I').clearContent().uncheck();
    clearEmptyRowsMasterSheet();
  }
};
// Adiciona os bixos que estão no banco de dados
const appendToMasterSheet = bixos => {
  clearEmptyRowsMasterSheet();
  const firstRow = masterSheet.getRange('A2:I2');
  const values = bixos.map(bixo => [bixo.name, bixo.emphasis, '-', '', '', '??? (não se sabe)', bixo.godparent, '-', '-']);

  let maxRows = masterSheet.getMaxRows();
  // Caso a primeira linha da planilha principal esteja vazia, insere o primeiro bixo nela
  if (!firstRow.getValues()[0].reduce((acc, cur) => acc || cur)) {
    firstRow.setValues([values[0]]);
    values.splice(0, 1);
    masterSheet.getRange('D2').check().uncheck();
    masterSheet.getRange('E2').check().uncheck();
  }
  // Insere os valores na planilha principal
  masterSheet
    .insertRowsAfter(maxRows++, values.length)
    .getRange(`A${maxRows}:I`)
    .setValues(values);
  // limpa a planilha "DB - Bixos"
  clearBixosDB();
  // Só pra dar um refresh no query da planilha "Bixos Perdidos"
  masterSheet.getRange(`D${maxRows}:D`).check().uncheck();
  masterSheet.getRange(`D${maxRows}:E`).check().uncheck();
};
// Evaluates the current email's subject
const getEmailSubject = name => emailSubject.replace('$(nomeVeteran@)', name) || 'Adoção de Bixos da Elétrica ' + new Date().getFullYear();
// Envia emails para os padrinhos e madrinhas
// com as informações dos bixos que adotaram
const sendEmails = bixos => {
  if (emailBody.search(/<[u,o]l>[^<uol>]*?\$\(listarBixos\)[^<uol>]?<\/[u,o]l>/gms) < 0) {
    ui.alert(
      'Erro!',
      'Infelizmente os emails para os padrinhos/madrinhas não puderam ser enviados - o corpo do email está num formato inválido.\n\nÉ necessário incluir a variável $(listarBixos) no texto e ela deve estar dentro de uma lista.\n\nEx: <ol>$(listarBixos)</ol>, <ul>$(listarBixos)</ol>.\n\nVale lembrar que essa variável será substituída por uma lista de bixos no formado: <li>NOME_DO_BIXO (ÊNFASE_DO_BIXO)</li>.',
      ui.ButtonSet.OK,
    );

    return;
  } else if (Session.getActiveUser().getEmail() !== ALLOWED_EMAIL) {
    ui.alert(
      'Erro!',
      `Infelizmente os emails para os padrinhos/madrinhas não puderam ser enviados. Para enviá-los, é necessário rodar o script com o ${ALLOWED_EMAIL}.`,
      ui.ButtonSet.OK,
    );

    return;
  }
  // Objeto com relação veterano-bixos
  // Cada chave vai ser o nome de um veterano
  // Cada valor vai ser um objeto com as informações (email e bixos) daquele veterano
  // { 'email': String, 'bixos': [{'name', 'emphasis', 'godparent', 'godparentEmail'}] }
  const infoGodparents = {};

  // Povoa o infoGodparents
  bixos.forEach(bixo =>
    infoGodparents[bixo.godparent]
      ? infoGodparents[bixo.godparent].bixos.push({ ...bixo })
      : (infoGodparents[bixo.godparent] = { email: bixo.godparentEmail, bixos: [{ ...bixo }] }),
  );
  Logger.log('Enviando emails...');
  for (const veterano of Object.keys(infoGodparents)) {
    // String com as informações de um bixo por linha, no formato '<li>NOME_DO_BIXO (ÊNFASE_DO_BIXO)</li>'
    const listBixos = infoGodparents[veterano].bixos.reduce((acc, cur) => `${acc}\n<li>${cur.name} (${cur.emphasis})</li>`, '');
    // Email title
    const subject = getEmailSubject(veterano.split(' ')[0]);
    // Corpo do email com as informações corretar inseridas
    const body = emailBody.replace('$(nomeVeteran@)', veterano.split(' ')[0]).replace('$(listarBixos)', listBixos);

    // Envia o email
    MailApp.sendEmail({ to: infoGodparents[veterano].email, subject, htmlBody: body });
    Logger.log(`Email enviado: ${veterano} ${infoGodparents[veterano].email}`);
  }
  ui.alert('Os emails foram enviados com sucesso!', ui.ButtonSet.OK);
};
// Cria uma planilha pra cada chamada quando
// os bixos são sorteados
const createTable = bixos => {
  // Recebe o título da chamada
  let r = ui.prompt(
    'Qual é o título dessa chamada?',
    'Ex: "Primeira Chamada FUVEST", "Segunda Chamada SISU", "Terceira Chamada", etc\n',
    ui.ButtonSet.OK,
  );
  while (!r.getResponseText()) {
    r = ui.prompt(
      'Qual é o título dessa chamada?',
      'É necessário inserir o título da chamada para prosseguir.\n\nEx: "Primeira Chamada FUVEST", "Segunda Chamada SISU", "Terceira Chamada", etc',
      ui.ButtonSet.OK,
    );
  }
  // Título da chamada
  const title = r.getResponseText();
  // Separa as ênfases
  const eletronica = bixos.filter(b => b.emphasis === 'Eletrônica').map(b => b.name);
  const automa = bixos.filter(b => b.emphasis === 'Automação').map(b => b.name);

  // Esconde as listas de chamadas anteriores
  // (as que comçam com "[*] ")
  ss.getSheets().forEach(sheet => {
    if (sheet.getName().startsWith('[*] ')) {
      sheet.hideSheet();
    }
  });
  const newSheet = ss.getSheetByName('[*] Template - Chamada').copyTo(ss).setName(`[*] ${title}`).showSheet();
  // Insere o título da chamada na primeira célula
  const titleCell = newSheet.getRange('A1:B1');

  titleCell.setValue(titleCell.getValue().replace('$(títuloChamada)', title));
  // Crias as linhas necessárias para os outros bixos
  // E arruma a formatação delas
  newSheet.insertRowsAfter(2, Math.max(eletronica.length, automa.length));
  newSheet
    .getRange(`A3:B`)
    .setFontWeight('normal')
    .setBorder(null, null, false, null, true, null, 'black', app.BorderStyle.SOLID)
    .setHorizontalAlignment('left');
  // Insere os bixos da Eletrônica
  if (eletronica.length) {
    newSheet.getRange(`A3:A${2 + eletronica.length}`).setValues(eletronica.map(b => [b]));
  }
  // Insere os bixos da Automação
  if (automa.length) {
    newSheet.getRange(`B3:B${2 + automa.length}`).setValues(automa.map(b => [b]));
  }
  newSheet.autoResizeColumns(1, 2);
  newSheet.autoResizeRows(3, newSheet.getMaxRows() - 2);
  newSheet.protect().setWarningOnly(true);
};
const main = () => {
  Logger.log(`Script sendo rodado por: ${Session.getActiveUser().getEmail()}`);
  if (Session.getActiveUser().getEmail() !== ALLOWED_EMAIL) {
    const r = ui.prompt(
      'Os emails para os padrinhos/madrinhas não serão enviados!',
      `Para enviá-los, é necessário rodar o script com o ${ALLOWED_EMAIL}. Você deseja continuar com o sorteio dos bixos mesmo assim?`,
      ui.ButtonSet.YES_NO,
    );

    if (r.getSelectedButton() === ui.Button.NO) {
      return;
    }
  } else if (emailBody.search(/<[u,o]l>[^<uol>]*?\$\(listarBixos\)[^<uol>]?<\/[u,o]l>/gms) < 0) {
    const r = ui.prompt(
      'Os emails para os padrinhos/madrinhas não serão enviados!',
      'O corpo do email para os veteranos está num formato inválido. Você deseja continuar com o sorteio dos bixos mesmo assim?\n\nOBS: É necessário incluir a variável $(listarBixos) no texto e ela deve estar dentro de uma lista. Essa variável será substituída por uma lista de bixos no formato: <li>NOME_DO_BIXO (ÊNFASE_DO_BIXO)</li>.\nEx: <ol>$(listarBixos)</ol>, <ul>$(listarBixos)</ol>.',
      ui.ButtonSet.YES_NO,
    );

    if (r.getSelectedButton() === ui.Button.NO) {
      return;
    }
  } else {
    ui.alert(
      'Cuidado!',
      'Vou te mostrar um exemplo dos emails que serão enviados para os padrinhos (mas infelizmente você só vai ter uns 20 segundos pra ler ele). Para visualizar o texto, é necessário que você tente "scrollar" no diálogo a seguir.\n\nVocê pode ler o modelo com mais calma na planilha "Template do Email", através do botão "VISUALIZAR EMAIL".',
      ui.ButtonSet.OK,
    );
    Utilities.sleep(24000);
    const r = ui.prompt('Cuidado!', 'Você deseja continuar com o sorteio e envio dos emails?', ui.ButtonSet.OK_CANCEL);

    if (r.getSelectedButton() === ui.Button.CANCEL) {
      return;
    }
  }
  const bixos = raffle();

  if (bixos) {
    appendToMasterSheet(bixos);
    sendEmails(bixos);
    createTable(bixos);
  }
};

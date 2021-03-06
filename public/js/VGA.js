const alerts = [];
let sinalSonoro = false;
const buildTable = () => {
    fetch("../Precos.json")
        .then(response => response.json())
        .then(mylist => {
            buildHtmlTable('#PrecosGPU', mylist);
        });
}

// Monta a table HTML a partir do JSON
function buildHtmlTable(selector, myList) {
    //Adiciona os headers
    let columns = addAllColumnHeaders(myList, selector);
    const filtros = [];
    for (let checkboxesMarcadas of $('.filterLeft input[type=checkbox]:checked')) {
        if (checkboxesMarcadas.value !== '3060') {
            filtros.push(new RegExp(formatName(checkboxesMarcadas.value), 'g'));
        } else if (checkboxesMarcadas.value === '3060') {
            filtros.push(new RegExp(formatName('3060[^ti]'), 'g'));
        }
    }

    let shouldAlert = false;
    sinalSonoro = $('#filtroSonoro').is(':checked');
    //Para cada registro da lista
    for (var i = 0; i < myList.length; i++) {

        const formattedName = formatName(myList[i][columns[0]]);
        const todasChecked = $('#filtertodas:checked').length > 0;
        //Traz somente as placas do filtro, ou todas, caso marcado o checkbox de todas
        if (filtros.some(v => formattedName.match(v)) || todasChecked || i === 0) {

            if (alerts.some(v => {
                return formattedName.includes(v.Nome)
                    && formatValue(myList[i][columns[1]]) <= v.Valor
            })) {
                shouldAlert = true;
            }
            let row$ = $('<tr/>');

            //Para cada coluna do registro, indo de 0 a 3 -> Modelo, valor a vista, valor parcelado, Loja. Próximo elemento seria o Link, que não é necessário
            for (let colIndex = 0; colIndex <= 3; colIndex++) {
                let cellValue;

                //Se for a primeira coluna, será o modelo - onde é necessário adicionar o link
                if (colIndex === 0) {
                    cellValue = '<a href="' + myList[i][columns[4]] + '">' + myList[i][columns[colIndex]] + '</a>';
                    //Caso contrário, apenas adicionar o conteúdo em tela
                } else {
                    cellValue = myList[i][columns[colIndex]];
                }

                //Se for nulo, adicionar string vazia
                if (cellValue == null) cellValue = "";

                //Dar append à row
                row$.append($('<td/>').html(cellValue));

            }
            //Dar append ao objeto da table
            $(selector).append(row$);
        }
    }

    if (shouldAlert) {
        if (sinalSonoro) {
            document.getElementById('audioAlert').play();
        }
        alert('Um dos seus itens monitorados foi encontrado!');
    }

}

function addAllColumnHeaders(myList, selector) {
    var columnSet = [];
    var headerTr$ = $('<tr/>');

    //Pega o primeiro objeto do array de JSON
    var rowHash = myList[0];
    //Pra cada campo do objeto
    for (var key in rowHash) {
        //Adiciona o campo ao columnSet
        columnSet.push(key);
        //Se for o campo "Link", não adiciona como header pois será linkado no modelo
        if (key !== 'Link') {
            headerTr$.append($('<th/>').html(key));
        }
    }

    //Dá append no header
    $(selector).append(headerTr$);

    //Retorn a informação das colunas
    return columnSet;
}


const deleteTable = () => {
    $('#PrecosGPU').empty();
    buildTable();
}

const formatValue = (value) => {
    return Number(value.replace('R$', '').replaceAll('.', '').replaceAll(',', '.'));
}

const formatName = (name) => {
    return name.toUpperCase().replaceAll(' ', '');
}

$(document).ready(() => {
    $('#atualizarLista').on('click', () => {
        deleteTable();
    })

    $('#criarAlerta').on('click', () => {

        let nome = $('#filtrokeyWord').val();
        let valor = $('#filtroValue').val()
        alerts.push({
            Nome: formatName(nome),
            Valor: valor
        });
        $('#containerMonitoramento').append('<p><b>Palavra chave:</b> ' + nome + '. <b>Valor:</b> ' + valor + ' </p>');
        $('#filtrokeyWord').val('');
        $('#filtroValue').val('');

    })

    setInterval(() => {
        $('#atualizarLista').click()
    }, 120000);
})

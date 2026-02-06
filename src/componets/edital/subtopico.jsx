import React from 'react';

function Subtopico({ sub, topId, discId, abrirModal, apagarSubtopico }) {
    return (
        <div>
            <div className='element-edital element-subtopico'>
                <div className='item-opcoesEdital'>
                    <input type="checkbox" className='inputCheckBox' />
                    <span className='material-icons opcoes-deleteEdital' onClick={() => apagarSubtopico(discId, topId, sub.id)}>delete</span>
                    <span className='material-icons opcoes-editEdital' onClick={() => abrirModal('subtopico', topId, discId, sub.nome, sub.id)}>edit</span>
                </div>
                <div className='item-nomeEdital'>
                    <span className='material-icons icon-transparentEdital'>arrow_drop_down</span>
                    <p>{sub.index}</p>
                    <p className='nome-editalPadrao'>{sub.nome}</p>
                </div>
                <div className='item-estatisticaEdital'>
                    <div className='estatistica-padraoEdital'><p>tempo</p>{sub.tempo}</div>
                    <div className='estatistica-padraoEdital'><p>acertos</p>{sub.acertos.toString().padStart(3, '0')}</div>
                    <div className='estatistica-padraoEdital'><p>erros</p>{sub.erros.toString().padStart(3, '0')}</div>
                    <div className='estatistica-padraoEdital'><p>%</p>{sub.porcentagem}</div>
                </div>
                <div className='item-addEdital'>
                    <button className='btn-addEdital btn-transparenteEdital'></button>
                </div>
            </div>
        </div>
    );
}
export default Subtopico;
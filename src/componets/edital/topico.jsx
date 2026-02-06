import React from 'react';
import Subtopico from './subtopico';

function Topico({ top, discId, planoId, abrirModal, apagarTopico, apagarSubtopico, topicoAberto, alternarTopico }) {
    return (
        <div>
            <div className='element-edital element-topico'>
                <div className='item-opcoesEdital'>
                    <input type="checkbox" />
                    <span className='material-icons opcoes-deleteEdital' onClick={() => apagarTopico(discId, top.id)}>delete</span>
                    <span className='material-icons opcoes-editEdital' onClick={() => abrirModal('topico', top.id, discId, top.nome, top.id)}>edit</span>
                </div>

                <div className='item-nomeEdital' onClick={alternarTopico} style={{ cursor: 'pointer' }}>
                    <span className='material-icons'>{topicoAberto ? 'arrow_drop_down' : 'arrow_right'}</span>
                    <p>{top.index}</p>
                    <p className='nome-editalPadrao'>{top.nome}</p>
                </div>

                <div className='item-estatisticaEdital'>
                    <div className='estatistica-padraoEdital'><p>tempo</p>{top.tempo}</div>
                    <div className='estatistica-padraoEdital'><p>acertos</p>{top.acertos.toString().padStart(3, '0')}</div>
                    <div className='estatistica-padraoEdital'><p>erros</p>{top.erros.toString().padStart(3, '0')}</div>
                    <div className='estatistica-padraoEdital'><p>%</p>{top.porcentagem}</div>
                </div>
                <div className='item-addEdital'>
                    <button className='btn-addEdital' onClick={(e) => { e.stopPropagation(); abrirModal('subtopico', top.id, discId); }}>adicione um subtópico</button>
                </div>
            </div>

            <div className='container-mostraSubtopico'>
                {topicoAberto && top.subtopicos && top.subtopicos.map((sub) => (
                    <Subtopico
                        key={sub.id} sub={sub} topId={top.id} discId={discId}
                        abrirModal={abrirModal} apagarSubtopico={apagarSubtopico}
                    />
                ))}
            </div>
        </div>
    );
}
export default Topico;
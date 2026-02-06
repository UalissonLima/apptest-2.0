import React from 'react';
import Topico from './topico';

function Disciplina({ disc, planoId, abrirModal, apagarDisciplina, apagarTopico, apagarSubtopico, estaAberta, alternarVisibilidade, topicosAbertos, alternarTopico }) {
    return (
        <div>
            <div className='element-edital element-disciplina'>
                <div className='item-opcoesEdital'>
                    <input type="checkbox" />
                    <span className='material-icons opcoes-deleteEdital' onClick={() => apagarDisciplina(disc.id)}>delete</span>
                    <span className='material-icons opcoes-editEdital' onClick={() => abrirModal('disciplina', disc.id, null, disc.nome)}>edit</span>
                </div>

                <div className='item-nomeEdital' onClick={alternarVisibilidade} style={{ cursor: 'pointer' }}>
                    <span className='material-icons'>{estaAberta ? 'arrow_drop_down' : 'arrow_right'}</span>
                    <p className='nome-editalPadrao'>{disc.nome}</p>
                </div>

                <div className='item-estatisticaEdital'>
                    <div className='estatistica-padraoEdital'><p>tempo</p>{disc.tempo}</div>
                    <div className='estatistica-padraoEdital'><p>acertos</p>{disc.acertos.toString().padStart(3, '0')}</div>
                    <div className='estatistica-padraoEdital'><p>erros</p>{disc.erros.toString().padStart(3, '0')}</div>
                    <div className='estatistica-padraoEdital'><p>%</p>{disc.porcentagem}</div>
                </div>
                <div className='item-addEdital'>
                    <button className='btn-addEdital' onClick={(e) => { e.stopPropagation(); abrirModal('topico', disc.id); }}>adicione um tópico</button>
                </div>
            </div>

            <div className='container-mostraTopico'>
                {estaAberta && disc.topicos && disc.topicos.map((top) => (
                    <Topico
                        key={top.id} top={top} discId={disc.id} planoId={planoId}
                        abrirModal={abrirModal} apagarTopico={apagarTopico} apagarSubtopico={apagarSubtopico}
                        topicoAberto={topicosAbertos.includes(top.id)} alternarTopico={() => alternarTopico(top.id)}
                    />
                ))}
            </div>
        </div>
    );
}
export default Disciplina;
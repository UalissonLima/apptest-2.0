import React from 'react'
import "./addEdital.css"

function AddEdital({modoEdicao, tipoModal, nomeItem, setNomeItemAdd, fecharModal, manipularSalvar}) {
    return (
        <div className='modal-sobreposicaoRegistroEdital'>
            <div className='container-mainRegistroEdital'>
                <div className='element-registroEdital'>
                    <div className='item-nomeRegistroEdital'>
                        <p>{modoEdicao ? 'editar' : 'adicione o nome da'} {tipoModal}</p>
                        <input
                            type="text"
                            className='input-registroEdital'
                            value={nomeItem}
                            onChange={(e) => setNomeItemAdd(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className='item-btnRegistroEdital'>
                        <button className='btn-padraoRegistroEdital btnCancelarRegistroEdital' onClick={fecharModal}>cancelar</button>
                        <button className='btn-padraoRegistroEdital btnSalvarRegistroEdital' onClick={manipularSalvar}>
                            {modoEdicao ? 'atualizar' : 'salvar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddEdital
import React, { useState } from 'react'
import "./addPlano.css"

function AddPlano({ aoSalvar, aoCancelar }) {
    const [nomeEdital, setNomeEdital] = useState('');

    const manipularSalvar = () => {
        if (nomeEdital.trim() === '') {
            alert("Por favor, digite o nome do plano.");
            return;
        }
        aoSalvar(nomeEdital);
    };

    return (
        <div className='modal-sobreposicaoPlano'>
            <div className='container-mainRegistroPlano'>
                <div className='element-registroPlano'>
                    <div className='item-nomeRegistroPlano'>
                        <p>adicione o nome do plano</p>
                        <input
                            type="text"
                            className='input-registroPlano'
                            value={nomeEdital}
                            onChange={(e) => setNomeEdital(e.target.value)}
                            maxLength={80}
                            placeholder="ex: ESA 2026"
                            autoFocus
                        />
                    </div>

                    <div className='item-btnRegistroPlano'>
                        <button
                            className='btn-padraoRegistroPlano btn-cancelarRegistroPlano'
                            onClick={aoCancelar}
                        >
                            cancelar
                        </button>
                        <button
                            className='btn-padraoRegistroPlano btn-salvarRegistroPlano'
                            onClick={manipularSalvar}
                        >
                            salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddPlano
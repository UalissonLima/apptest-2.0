import React, { useState, useEffect } from 'react'
import "./addLembrete.css"

function AddLembrete({ aoSalvar, aoCancelar, dadosIniciais }) {
    const [data, setData] = useState('');
    const [hora, setHora] = useState('');
    const [texto, setTexto] = useState('');

    const hoje = new Date().toISOString().split('T')[0];

    // Lógica para preencher os campos se for uma edição
    useEffect(() => {
        if (dadosIniciais) {
            // Converte DD/MM/AAAA de volta para AAAA-MM-DD para o input date
            const dataISO = dadosIniciais.data.split('/').reverse().join('-');
            setData(dataISO);
            setHora(dadosIniciais.hora);
            setTexto(dadosIniciais.texto);
        }
    }, [dadosIniciais]);

    const manipularSalvar = () => {
        if (!data || !hora || !texto) {
            alert("Preencha todos os campos!");
            return;
        }

        if (data < hoje) {
            alert("Você não pode agendar um lembrete para uma data que já passou!");
            return;
        }

        const dataFormatada = data.split('-').reverse().join('/');

        aoSalvar({
            data: dataFormatada,
            hora: hora,
            texto: texto
        });
    };

    return (
        <div className='modal-sobreposicaoLembrete'>
            <div className='container-mainRegistroLembrete'>
                <div className='element-registroLembrete'>
                    <div className='item-dataRegistroLembrete'>
                        <p>{dadosIniciais ? 'editar data' : 'adicione a data'}</p>
                        <input
                            className='input-padraoRegistroLembrete'
                            type="date"
                            name="date"
                            min={hoje}
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                        />
                    </div>

                    <div className='item-horaRegistroLembrete'>
                        <p>{dadosIniciais ? 'editar hora' : 'adicione a hora'}</p>
                        <input
                            className='input-padraoRegistroLembrete'
                            type="time"
                            name="time"
                            value={hora}
                            onChange={(e) => setHora(e.target.value)}
                        />
                    </div>
                </div>

                <div className='element-textoRegistroLembrete'>
                    <div className='item-textoRegistroLembrete'>
                        {dadosIniciais ? 'editar lembrete' : 'adicione seu lembrete'} ({texto.length}/500)
                    </div>

                    <textarea
                        className='item-textAreaRegistroLembrete'
                        value={texto}
                        maxLength={500}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder="digite aqui seu lembrete..."
                    />
                </div>

                <div className='item-btnRegistroLembrete'>
                    <button className='btn-padraRegistroLembrete btn-cancelarRegistroLembrete' onClick={aoCancelar}>
                        cancelar
                    </button>

                    <button className='btn-padraRegistroLembrete btn-salvarRegistroLembrete' onClick={manipularSalvar}>
                        {dadosIniciais ? 'atualizar' : 'salvar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddLembrete
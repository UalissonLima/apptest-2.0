import React, { useState, useEffect } from 'react'
import "./cronometro.css"
import AddRegistro from '../addRegistro/addRegistro'

function Cronometro() {
    const [segundos, setSegundos] = useState(() => {
        const salvo = localStorage.getItem('cronometro_segundos');
        return salvo ? parseInt(salvo, 10) : 0;
    });
    const [ativo, setAtivo] = useState(() => {
        const salvo = localStorage.getItem('cronometro_ativo');
        return salvo === 'true';
    });
    const [agora, setAgora] = useState(new Date());
    const [mostrarModal, setMostrarModal] = useState(false);

    useEffect(() => {
        const timerRelogio = setInterval(() => setAgora(new Date()), 1000);
        return () => clearInterval(timerRelogio);
    }, []);

    useEffect(() => {
        localStorage.setItem('cronometro_ativo', ativo);
        if (ativo) {
            if (!localStorage.getItem('cronometro_inicio')) {
                const tempoInicio = Date.now() - (segundos * 1000);
                localStorage.setItem('cronometro_inicio', tempoInicio.toString());
            }
        } else {
            localStorage.removeItem('cronometro_inicio');
        }
    }, [ativo]);

    useEffect(() => {
        let intervalo = null;
        if (ativo) {
            intervalo = setInterval(() => {
                const inicio = parseInt(localStorage.getItem('cronometro_inicio'), 10);
                if (inicio) {
                    const totalSegundos = Math.floor((Date.now() - inicio) / 1000);
                    setSegundos(totalSegundos);
                    localStorage.setItem('cronometro_segundos', totalSegundos.toString());
                }
            }, 1000);
        }
        return () => clearInterval(intervalo);
    }, [ativo]);

    const obterDiaSemana = () => {
        const dias = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
        return dias[agora.getDay()];
    };

    const obterDataFormatada = () => {
        const dia = agora.getDate().toString().padStart(2, '0');
        const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
        const ano = agora.getFullYear().toString().slice(-2);
        return `${dia}/${mes}/${ano}`;
    };

    const obterDataParaInput = () => agora.toISOString().split('T')[0];
    const obterHoraAtual = () => agora.toLocaleTimeString('pt-BR');
    const alternarPlayPause = () => setAtivo(!ativo);

    const zerarCronometro = () => {
        setAtivo(false);
        setSegundos(0);
        localStorage.removeItem('cronometro_segundos');
        localStorage.removeItem('cronometro_ativo');
        localStorage.removeItem('cronometro_inicio');
    };

    const formatarTempoCronometro = () => {
        const hrs = Math.floor(segundos / 3600);
        const mins = Math.floor((segundos % 3600) / 60);
        const secs = segundos % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const finalizarEstudo = () => {
        setAtivo(false);
        setMostrarModal(true);
    };

    return (
        <>
            {mostrarModal && (
                <AddRegistro
                    dataAtual={obterDataParaInput()}
                    tempoTotal={formatarTempoCronometro()}
                    fecharModal={() => setMostrarModal(false)}
                    // PASSAMOS A FUNÇÃO DIRETAMENTE PARA O MODAL USAR APÓS O ADD DOC
                    zerarCronometro={zerarCronometro}
                />
            )}

            <div className='container-mainCronometro'>
                <div className='element-dataHoraCronometro'>
                    <div className='item-dataCronometro'>
                        <span>{obterDiaSemana()}</span>
                        <div className='data-formatadaCronometro'>
                            <span className='material-icons'>calendar_month</span>
                            <p>{obterDataFormatada()}</p>
                        </div>
                    </div>

                    <div className='item-horaCronometro'>
                        <div className='hora-formatadaCronometro'>
                            <span className='material-icons'>alarm</span>
                            <p>{obterHoraAtual()}</p>
                        </div>
                    </div>
                </div>

                <div className='element-tempoCronometro'>
                    {formatarTempoCronometro()}
                </div>

                <div className='element-btnCronometro'>
                    <button className='btn-padraoCronometro btn-playCronometro' onClick={alternarPlayPause}>
                        <span className='material-icons'>
                            {ativo ? 'pause_circle' : 'play_circle'}
                        </span>
                        <p>{ativo ? 'pause' : 'play'}</p>
                    </button>

                    <button
                        className='btn-padraoCronometro btn-zeraCronometro'
                        onClick={zerarCronometro}
                        disabled={segundos === 0}
                        style={{ opacity: segundos === 0 ? 0.5 : 1, cursor: segundos === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        <span className='material-icons'>stop_circle</span>
                        <p>zerar</p>
                    </button>

                    <button
                        className='btn-padraoCronometro btn-finalizarCronometro'
                        onClick={finalizarEstudo}
                        disabled={segundos === 0}
                        style={{ opacity: segundos === 0 ? 0.5 : 1, cursor: segundos === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        <span className='material-icons'>check_circle</span>
                        <p>finalizar</p>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Cronometro
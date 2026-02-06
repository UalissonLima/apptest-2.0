import React, { useState, useEffect } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './calendario.css';
import { db } from '../../firebase'; // Verifique o caminho do seu firebase.js
import { collection, onSnapshot, query, where } from "firebase/firestore";

function Calendario() {
    const [mesAtual, setMesAtual] = useState(new Date());
    const [diaSelecionado, setDiaSelecionado] = useState(new Date());
    const [historico, setHistorico] = useState([]);

    // 1. Busca todo o histórico (ou você pode filtrar por planoId se preferir)
    useEffect(() => {
        const q = query(collection(db, "historico"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setHistorico(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    // 2. Filtra os registros do dia selecionado
    // Nota: reg.data costuma ser "YYYY-MM-DD" no input type date
    const registrosDoDia = historico.filter(reg => {
        const dataReg = parseISO(reg.data);
        return isSameDay(dataReg, diaSelecionado);
    });

    // 3. Calcula o tempo total do dia
    const calcularTempoTotal = () => {
        let totalMinutos = 0;
        registrosDoDia.forEach(reg => {
            if (reg.horaEstudada) {
                const [h, m] = reg.horaEstudada.split(':').map(Number);
                totalMinutos += (h * 60) + m;
            }
        });
        const horas = Math.floor(totalMinutos / 60);
        const mins = totalMinutos % 60;
        return `${horas}h ${mins}m`;
    };

    // 4. Pega os nomes das disciplinas estudadas (sem repetir nomes)
    const disciplinasDoDia = [...new Set(registrosDoDia.map(reg => reg.disciplinaNome))].join('; ');

    // Navegação
    const proximoMes = () => setMesAtual(addMonths(mesAtual, 1));
    const mesAnterior = () => setMesAtual(subMonths(mesAtual, 1));

    const inicioDoMes = startOfMonth(mesAtual);
    const fimDoMes = endOfMonth(inicioDoMes);
    const dataInicial = startOfWeek(inicioDoMes, { weekStartsOn: 0 });
    const dataFinal = endOfWeek(fimDoMes, { weekStartsOn: 0 });

    const dias = eachDayOfInterval({ start: dataInicial, end: dataFinal });

    return (
        <div className="container-mainCalendario">
            <div className="element-mesCalendario">
                <button className="btn-mesPadraoCalanderio" onClick={mesAnterior}>&lt;</button>
                <div style={{ textTransform: 'lowercase' }} className='nome-mesCalendario'>
                    {format(mesAtual, 'MMMM', { locale: ptBR }).toLowerCase()}
                    <span> {format(mesAtual, 'yyyy')}</span>
                </div>
                <button className="btn-mesPadraoCalanderio" onClick={proximoMes}>&gt;</button>
            </div>

            <div className='box-calendario'>
                <div className="element-semanaCalendario">
                    {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(dia => (
                        <div key={dia} className="item-nomeSemanaCalendario">{dia}</div>
                    ))}
                </div>

                <div className='element-diaCalendario'>
                    {dias.map((dia, index) => {
                        const foraDoMes = !isSameMonth(dia, inicioDoMes);
                        const selecionado = isSameDay(dia, diaSelecionado);

                        // Verifica se este dia no grid tem algum estudo para colocar uma marcação (opcional)
                        const temEstudo = historico.some(h => isSameDay(parseISO(h.data), dia));

                        return (
                            <div
                                key={index}
                                className={`item-diaCalendario ${foraDoMes ? 'item-diaFora' : ''} ${selecionado ? 'item-diaSelecionado' : ''} ${temEstudo ? 'item-diaComEstudo' : ''}`}
                                onClick={() => setDiaSelecionado(dia)}
                            >
                                {format(dia, 'd')}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className='element-infosCalendario'>
                {/* SÓ APARECE SE TIVER REGISTRO NO DIA SELECIONADO */}
                {registrosDoDia.length > 0 && (
                    <>
                        <div className='item-tempoInfosCalendario'>
                            <p className='nome-tempoInfos'>tempo estudado no dia:</p>
                            <p>{calcularTempoTotal()}</p>
                        </div>

                        <div className='item-disciplinasCalendario'>
                            <p className='nome-disciplinaInfos'>disciplinas estudadas:</p>
                            <p className='disciplinas-infos'>{disciplinasDoDia}</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Calendario;
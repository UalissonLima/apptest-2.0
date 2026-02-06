import React, { useState, useEffect } from 'react'
import "./infos.css"
import { db } from '../../firebase'
import { collection, onSnapshot, query } from "firebase/firestore"

function Infos() {
    const [stats, setStats] = useState({
        tempoHoje: '00h 00h',
        tempoTotal: '00h 00h',
        acertos: 0,
        erros: 0,
        porcentagem: '0%'
    });

    // Função para somar tempos no formato "HH:MM"
    const somarTempos = (listaTempos) => {
        let totalMinutos = 0;
        listaTempos.forEach(t => {
            if (!t) return;
            const [h, m] = t.split(':').map(Number);
            totalMinutos += (h * 60) + m;
        });
        const horas = Math.floor(totalMinutos / 60);
        const minutos = totalMinutos % 60;
        return `${horas}h ${minutos.toString().padStart(2, '0')}m`;
    };

    useEffect(() => {
        const q = query(collection(db, "historico"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const hojeStr = new Date().toISOString().split('T')[0]; // Formato AAAA-MM-DD
            let temposHoje = [];
            let temposTotal = [];
            let totalAcertos = 0;
            let totalErros = 0;

            snapshot.docs.forEach(doc => {
                const data = doc.data();

                // Soma para o Tempo Total
                temposTotal.push(data.horaEstudada);

                // Filtra o que é de Hoje
                if (data.data === hojeStr) {
                    temposHoje.push(data.horaEstudada);
                }

                // Soma Questões e Simulados (usando a lógica de soma que criamos no histórico)
                const acertosReg = (Number(data.questoes?.acertos) || 0) + (Number(data.simulado?.acertos) || 0);
                const errosReg = (Number(data.questoes?.erros) || 0) + (Number(data.simulado?.erros) || 0);

                totalAcertos += acertosReg;
                totalErros += errosReg;
            });

            // Cálculo da Porcentagem
            const totalQuestoes = totalAcertos + totalErros;
            const perc = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;

            setStats({
                tempoHoje: somarTempos(temposHoje),
                tempoTotal: somarTempos(temposTotal),
                acertos: totalAcertos,
                erros: totalErros,
                porcentagem: `${perc}%`
            });
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className='container-mainInfos'>
            <div className='element-padraoInfos'>
                <div className='item-padraoInfos'>
                    <span className='material-icons'>today</span>
                    <p>tempo estudado hoje</p>
                </div>
                <div className='item-padraoTempoInfos'>
                    <p>{stats.tempoHoje}</p>
                </div>
            </div>

            <div className='element-padraoInfos'>
                <div className='item-padraoInfos'>
                    <span className='material-icons'>timer</span>
                    <p>tempo total estudado</p>
                </div>
                <div className='item-padraoTempoInfos'>
                    <p>{stats.tempoTotal}</p>
                </div>
            </div>

            <div className='element-padraoInfos'>
                <div className='item-padraoInfos'>
                    <span className='material-icons'>list_alt</span>
                    <p>questões realizadas</p>
                </div>

                <div className='item-questoesInfos'>
                    <p className='porcentagem-infos'>{stats.porcentagem}</p>

                    <div className='acertosErros-infos'>
                        <p className='acertos-infos'>{stats.acertos} acertos</p>
                        <p className='erros-infos'>{stats.erros} erros</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Infos
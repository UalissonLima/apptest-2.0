import React, { useState, useEffect } from 'react';
import './edital.css';
import AddEdital from './addEdital/addEdital';
import Disciplina from './disciplina';
import { db } from '../../firebase';
import {
    collection, onSnapshot, query, orderBy, addDoc,
    serverTimestamp, doc, updateDoc, getDoc, deleteDoc, where
} from "firebase/firestore";

function Edital({ plano }) {
    const [disciplinas, setDisciplinas] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [tipoModal, setTipoModal] = useState('disciplina');
    const [nomeItem, setNomeItem] = useState('');
    const [paiId, setPaiId] = useState(null);
    const [avoId, setAvoId] = useState(null);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [idParaEditar, setIdParaEditar] = useState(null);
    const [disciplinasAbertas, setDisciplinasAbertas] = useState([]);
    const [topicosAbertos, setTopicosAbertos] = useState([]);

    // 1. BUSCA DISCIPLINAS
    useEffect(() => {
        const q = query(collection(db, "planos", plano.id, "disciplinas"), orderBy("dataCriacao", "asc"));
        return onSnapshot(q, (snapshot) => {
            setDisciplinas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, [plano.id]);

    // 2. BUSCA HISTÓRICO DO PLANO PARA AS ESTATÍSTICAS
    useEffect(() => {
        const q = query(collection(db, "historico"), where("planoId", "==", plano.id));
        return onSnapshot(q, (snapshot) => {
            setHistorico(snapshot.docs.map(doc => doc.data()));
        });
    }, [plano.id]);

    // FUNÇÃO AUXILIAR PARA SOMAR TEMPO (HH:MM)
    const somarTempos = (tempos) => {
        let totalMinutos = 0;
        tempos.forEach(t => {
            const [h, m] = t.split(':').map(Number);
            totalMinutos += (h * 60) + m;
        });
        const horas = Math.floor(totalMinutos / 60);
        const mins = totalMinutos % 60;
        return `${horas.toString().padStart(2, '0')}h&${mins.toString().padStart(2, '0')}m`;
    };

    // 3. PROCESSA DISCIPLINAS COM ESTATÍSTICAS REAIS
    const disciplinasProcessadas = disciplinas.map(disc => {
        const topicosProcessados = (disc.topicos || []).map(top => {
            const subtopicosProcessados = (top.subtopicos || []).map(sub => {
                // Filtra histórico do subtópico
                const logsSub = historico.filter(h => h.subtopicoId === sub.id);
                const acertos = logsSub.reduce((acc, h) => acc + (Number(h.questoes?.acertos || 0) + Number(h.simulado?.acertos || 0)), 0);
                const erros = logsSub.reduce((acc, h) => acc + (Number(h.questoes?.erros || 0) + Number(h.simulado?.erros || 0)), 0);
                const tempo = somarTempos(logsSub.map(h => h.horaEstudada || "00:00"));
                const total = acertos + erros;
                const porcentagem = total > 0 ? Math.round((acertos / total) * 100) + "%" : "0%";

                return { ...sub, acertos, erros, tempo, porcentagem };
            });

            // Soma do Tópico (Baseado nos seus Subtópicos + logs diretos no Tópico se houver)
            const logsTop = historico.filter(h => h.topicoId === top.id && !h.subtopicoId);
            const acertosTop = subtopicosProcessados.reduce((acc, s) => acc + s.acertos, 0) + logsTop.reduce((acc, h) => acc + (Number(h.questoes?.acertos || 0) + Number(h.simulado?.acertos || 0)), 0);
            const errosTop = subtopicosProcessados.reduce((acc, s) => acc + s.erros, 0) + logsTop.reduce((acc, h) => acc + (Number(h.questoes?.erros || 0) + Number(h.simulado?.erros || 0)), 0);

            const temposParaSomar = [...subtopicosProcessados.map(s => s.tempo.replace('h&', ':').replace('m', '')), ...logsTop.map(h => h.horaEstudada)];
            const tempoTotalTop = somarTempos(temposParaSomar);
            const totalT = acertosTop + errosTop;
            const porcentagemTop = totalT > 0 ? Math.round((acertosTop / totalT) * 100) + "%" : "0%";

            return { ...top, subtopicos: subtopicosProcessados, acertos: acertosTop, erros: errosTop, tempo: tempoTotalTop, porcentagem: porcentagemTop };
        });

        // Soma da Disciplina
        const acertosDisc = topicosProcessados.reduce((acc, t) => acc + t.acertos, 0);
        const errosDisc = topicosProcessados.reduce((acc, t) => acc + t.erros, 0);
        const tempoTotalDisc = somarTempos(topicosProcessados.map(t => t.tempo.replace('h&', ':').replace('m', '')));
        const totalD = acertosDisc + errosDisc;
        const porcentagemDisc = totalD > 0 ? Math.round((acertosDisc / totalD) * 100) + "%" : "0%";

        return { ...disc, topicos: topicosProcessados, acertos: acertosDisc, erros: errosDisc, tempo: tempoTotalDisc, porcentagem: porcentagemDisc };
    });

    const abrirModal = (tipo, idReferencia = null, idAvo = null, nomeAtual = '', idEdit = null) => {
        setTipoModal(tipo); setPaiId(idReferencia); setAvoId(idAvo); setIdParaEditar(idEdit);
        if (nomeAtual) { setModoEdicao(true); setNomeItem(nomeAtual); }
        else { setModoEdicao(false); setNomeItem(''); }
        setMostrarModal(true);
    };

    const fecharModal = () => {
        setMostrarModal(false); setNomeItem(''); setPaiId(null); setAvoId(null); setModoEdicao(false); setIdParaEditar(null);
    };

    const manipularSalvar = async () => {
        if (!nomeItem.trim()) return;
        try {
            if (tipoModal === 'disciplina') {
                if (modoEdicao) {
                    await updateDoc(doc(db, "planos", plano.id, "disciplinas", paiId), { nome: nomeItem });
                } else {
                    const novaDisc = await addDoc(collection(db, "planos", plano.id, "disciplinas"), {
                        nome: nomeItem, tempo: '00h&00m', acertos: '000', erros: '000', porcentagem: '0%',
                        topicos: [], dataCriacao: serverTimestamp()
                    });
                    setDisciplinasAbertas(prev => [...prev, novaDisc.id]);
                }
            }
            else if (tipoModal === 'topico') {
                const discIdAlvo = modoEdicao ? avoId : paiId;
                const discRef = doc(db, "planos", plano.id, "disciplinas", discIdAlvo);
                const discSnap = await getDoc(discRef);
                const topicosAtuais = discSnap.data().topicos || [];

                if (modoEdicao) {
                    const novosTopicos = topicosAtuais.map(t => t.id === idParaEditar ? { ...t, nome: nomeItem } : t);
                    await updateDoc(discRef, { topicos: novosTopicos });
                } else {
                    const novoId = Date.now().toString();
                    const novoTopico = {
                        id: novoId, nome: nomeItem, index: `${topicosAtuais.length + 1}.0`,
                        subtopicos: []
                    };
                    await updateDoc(discRef, { topicos: [...topicosAtuais, novoTopico] });
                    if (!disciplinasAbertas.includes(paiId)) setDisciplinasAbertas(prev => [...prev, paiId]);
                    setTopicosAbertos(prev => [...prev, novoId]);
                }
            }
            else if (tipoModal === 'subtopico') {
                const discRef = doc(db, "planos", plano.id, "disciplinas", avoId);
                const discSnap = await getDoc(discRef);
                const topicos = discSnap.data().topicos;

                const topicosAtualizados = topicos.map(t => {
                    if (t.id === paiId) {
                        if (modoEdicao) {
                            const subsEditados = t.subtopicos.map(s => s.id === idParaEditar ? { ...s, nome: nomeItem } : s);
                            return { ...t, subtopicos: subsEditados };
                        } else {
                            const novoSub = {
                                id: Date.now().toString(), nome: nomeItem,
                                index: `${t.index.split('.')[0]}.${t.subtopicos.length + 1}`
                            };
                            return { ...t, subtopicos: [...t.subtopicos, novoSub] };
                        }
                    }
                    return t;
                });
                await updateDoc(discRef, { topicos: topicosAtualizados });
                if (!topicosAbertos.includes(paiId)) setTopicosAbertos(prev => [...prev, paiId]);
            }
            fecharModal();
        } catch (e) { console.error(e); }
    };

    const apagarDisciplina = async (id) => {
        if (window.confirm("Excluir disciplina?")) await deleteDoc(doc(db, "planos", plano.id, "disciplinas", id));
    };

    const apagarTopico = async (discId, topId) => {
        if (window.confirm("Excluir tópico?")) {
            const discRef = doc(db, "planos", plano.id, "disciplinas", discId);
            const discSnap = await getDoc(discRef);
            const novosTopicos = discSnap.data().topicos.filter(t => t.id !== topId)
                .map((t, i) => ({ ...t, index: `${i + 1}.0` }));
            await updateDoc(discRef, { topicos: novosTopicos });
        }
    };

    const apagarSubtopico = async (discId, topId, subId) => {
        if (window.confirm("Excluir subtópico?")) {
            const discRef = doc(db, "planos", plano.id, "disciplinas", discId);
            const discSnap = await getDoc(discRef);
            const topicos = discSnap.data().topicos.map(t => {
                if (t.id === topId) {
                    const filtrados = t.subtopicos.filter(s => s.id !== subId);
                    const reindexados = filtrados.map((s, i) => ({ ...s, index: `${t.index.split('.')[0]}.${i + 1}` }));
                    return { ...t, subtopicos: reindexados };
                }
                return t;
            });
            await updateDoc(discRef, { topicos });
        }
    };

    return (
        <div className='container-edital'>
            <div className='container-mainAddDisciplina' onClick={() => abrirModal('disciplina')}>
                clique aqui e adicione uma disciplina para o plano {plano.nome}
            </div>
            {mostrarModal && (
                <AddEdital fecharModal={fecharModal} tipoModal={tipoModal} nomeItem={nomeItem} setNomeItemAdd={setNomeItem} manipularSalvar={manipularSalvar} modoEdicao={modoEdicao} />
            )}
            <div className='container-mainEdital'>
                {disciplinasProcessadas.map((disc) => (
                    <Disciplina
                        key={disc.id} disc={disc} planoId={plano.id} abrirModal={abrirModal}
                        apagarDisciplina={apagarDisciplina} apagarTopico={apagarTopico} apagarSubtopico={apagarSubtopico}
                        estaAberta={disciplinasAbertas.includes(disc.id)} alternarVisibilidade={() => setDisciplinasAbertas(prev => prev.includes(disc.id) ? prev.filter(i => i !== disc.id) : [...prev, disc.id])}
                        topicosAbertos={topicosAbertos} alternarTopico={(id) => setTopicosAbertos(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                    />
                ))}
            </div>
        </div>
    );
}
export default Edital;
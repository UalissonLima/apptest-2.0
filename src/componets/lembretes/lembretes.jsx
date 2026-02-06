import React, { useState, useEffect } from 'react'
import "./lembretes.css"
import AddLembrete from './addLembrete/addLembrete'
import { db } from '../../firebase';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function Lembretes() {
    const [listaLembretes, setListaLembretes] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [lembreteParaEditar, setLembreteParaEditar] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "lembretes"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const dados = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setListaLembretes(dados);
        });
        return () => unsubscribe();
    }, []);

    const formatarParaDate = (dataStr, horaStr = "00:00") => {
        const [dia, mes, ano] = dataStr.split('/');
        return new Date(`${ano}-${mes}-${dia}T${horaStr}:00`);
    };

    // FUNÇÃO ATUALIZADA: REMOVE O "-FEIRA"
    const obterDiaSemana = (dataStr) => {
        try {
            const dataObj = formatarParaDate(dataStr);
            const diaSemana = format(dataObj, 'eeee', { locale: ptBR });
            // Aqui fazemos a mágica de remover o sufixo
            return diaSemana.replace('-feira', '');
        } catch (error) {
            return '';
        }
    };

    const calcularStatus = (lembrete) => {
        if (lembrete.concluido) return 'concluído';
        const dataVencimento = formatarParaDate(lembrete.data, lembrete.hora);
        const agora = new Date();
        return agora > dataVencimento ? 'atrasado' : 'pendente';
    };

    const lembretesOrdenados = [...listaLembretes].sort((a, b) => {
        if (a.concluido !== b.concluido) return a.concluido ? 1 : -1;
        if (!a.concluido) {
            return formatarParaDate(a.data, a.hora) - formatarParaDate(b.data, b.hora);
        }
        return (b.dataConclusao || 0) - (a.dataConclusao || 0);
    });

    const salvarLembrete = async (dadosLembrete) => {
        try {
            if (lembreteParaEditar) {
                const lembreteRef = doc(db, "lembretes", lembreteParaEditar.id);
                await updateDoc(lembreteRef, dadosLembrete);
            } else {
                await addDoc(collection(db, "lembretes"), {
                    ...dadosLembrete,
                    concluido: false,
                    dataConclusao: null,
                    criadoEm: serverTimestamp()
                });
            }
            fecharModal();
        } catch (error) {
            console.error("Erro ao salvar lembrete:", error);
        }
    };

    const alternarConcluido = async (lembrete) => {
        const lembreteRef = doc(db, "lembretes", lembrete.id);
        const novoStatus = !lembrete.concluido;
        try {
            await updateDoc(lembreteRef, {
                concluido: novoStatus,
                dataConclusao: novoStatus ? Date.now() : null
            });
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
        }
    };

    const excluirLembrete = async (id) => {
        if (window.confirm("Deseja realmente excluir este lembrete?")) {
            try {
                await deleteDoc(doc(db, "lembretes", id));
            } catch (error) {
                console.error("Erro ao excluir lembrete:", error);
            }
        }
    };

    const abrirEdicao = (lembrete) => {
        if (lembrete.concluido) return;
        setLembreteParaEditar(lembrete);
        setMostrarModal(true);
    };

    const fecharModal = () => {
        setMostrarModal(false);
        setLembreteParaEditar(null);
    };

    return (
        <div className='container-mainLembretes'>
            {mostrarModal && (
                <AddLembrete
                    aoSalvar={salvarLembrete}
                    aoCancelar={fecharModal}
                    dadosIniciais={lembreteParaEditar}
                />
            )}

            <div className='element-tituloLembretes'>lembretes</div>

            <div className='box-lembretes'>
                {lembretesOrdenados.length === 0 ? (
                    <div style={{ margin: 'auto', opacity: '0.5', fontStyle: 'italic', fontSize: 'var(--font-pequena)' }}>
                        nenhum lembrete por aqui...
                    </div>
                ) : (
                    lembretesOrdenados.map((lembrete) => {
                        const statusAtual = calcularStatus(lembrete);
                        const estaAtrasado = statusAtual === 'atrasado';
                        const estaConcluido = lembrete.concluido;

                        return (
                            <div className={`element-faixaLembretes ${estaConcluido ? 'element-faixaConcluido' : (estaAtrasado ? 'element-faixaAtrasada' : '')}`} key={lembrete.id}>
                                <div className='item-statusLembretes'
                                    style={{
                                        backgroundColor: estaConcluido ? 'var(--cor-botao-verde)' : (estaAtrasado ? 'var(--cor-botao-vermelho)' : 'var(--cor-botao-branco)'),
                                        fontWeight: 'bold'
                                    }}>
                                    <span className="status-lembrete">
                                        {statusAtual}
                                    </span>
                                </div>

                                <div className='item-nomeLembretes'>
                                    <div className='subItem-dataLembretes'>
                                        <span>{lembrete.hora}</span>
                                        <span>- {lembrete.data}</span>
                                        <span>- {obterDiaSemana(lembrete.data)}</span>
                                    </div>
                                    <div className={`nome-lembretes ${estaConcluido ? 'nome-concluidoLembretes' : ''}`}>
                                        {lembrete.texto}
                                    </div>
                                </div>

                                <div className='item-opcoesLembretes'>
                                    <span className="material-icons concluir-opcoesLembretes" onClick={() => alternarConcluido(lembrete)}>
                                        {estaConcluido ? 'task_alt' : 'radio_button_unchecked'}
                                    </span>

                                    <span className="material-icons apagar-opcoesLembretes" onClick={() => excluirLembrete(lembrete.id)}>
                                        cancel
                                    </span>

                                    <span
                                        className="material-icons editar-opcoesLembretes"
                                        onClick={() => abrirEdicao(lembrete)}
                                        style={{
                                            opacity: estaConcluido ? 0.3 : 1,
                                            cursor: estaConcluido ? 'not-allowed' : 'pointer'
                                        }}
                                        title={estaConcluido ? "Desconclua para poder editar" : "Editar lembrete"}
                                    >
                                        edit_square
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className='element-btnAddLembretes'>
                <button onClick={() => setMostrarModal(true)}>adicione um lembrete</button>
            </div>
        </div>
    )
}

export default Lembretes;
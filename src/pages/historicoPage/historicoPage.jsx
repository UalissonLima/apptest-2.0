import React, { useState, useEffect } from 'react'
import "./historicoPage.css"
import AddRegistro from '../../componets/addRegistro/addRegistro'
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function HistoricoPage() {
    const [registrosAgrupados, setRegistrosAgrupados] = useState({});
    const [modalAberto, setModalAberto] = useState(false);
    const [registroParaEditar, setRegistroParaEditar] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "historico"), orderBy("dataRegistro", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const dadosBrutos = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const agrupado = dadosBrutos.reduce((acc, curr) => {
                const dataObj = new Date(curr.data + 'T12:00:00');
                const dataFormatada = format(dataObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

                if (!acc[dataFormatada]) {
                    acc[dataFormatada] = [];
                }
                acc[dataFormatada].push(curr);
                return acc;
            }, {});

            setRegistrosAgrupados(agrupado);
        });

        return () => unsubscribe();
    }, []);

    const abrirEdicao = (registro) => {
        setRegistroParaEditar(registro);
        setModalAberto(true);
    };

    const deletarRegistro = async (id) => {
        if (window.confirm("Deseja apagar este registro?")) {
            try {
                await deleteDoc(doc(db, "historico", id));
            } catch (error) {
                console.error("Erro ao deletar:", error);
            }
        }
    };

    const datasOrdenadas = Object.keys(registrosAgrupados).sort((a, b) => {
        const dataA = parse(a, "dd 'de' MMMM 'de' yyyy", new Date(), { locale: ptBR });
        const dataB = parse(b, "dd 'de' MMMM 'de' yyyy", new Date(), { locale: ptBR });
        return dataB - dataA;
    });

    return (
        <div className='container-mainHistorico'>
            {modalAberto && (
                <AddRegistro
                    dataAtual={registroParaEditar?.data}
                    tempoTotal={registroParaEditar?.horaEstudada}
                    fecharModal={() => {
                        setModalAberto(false);
                        setRegistroParaEditar(null);
                    }}
                    dadosEdicao={registroParaEditar}
                />
            )}

            {datasOrdenadas.map((dataCabecalho) => (
                <div key={dataCabecalho} className="container-grupoData">
                    <div className='item-dataFormatadaHistorico'>{dataCabecalho}</div>

                    {registrosAgrupados[dataCabecalho].map((reg) => {
                        const totalAcertos = (Number(reg.questoes?.acertos) || 0) + (Number(reg.simulado?.acertos) || 0);
                        const totalErros = (Number(reg.questoes?.erros) || 0) + (Number(reg.simulado?.erros) || 0);

                        // Lógica condicional: verifica se "simulado" está no array de tipos
                        const temSimulado = reg.tiposEstudo?.some(tipo =>
                            tipo.toLowerCase().includes('simulado')
                        );

                        // MONTAGEM DO NOME DO SIMULADO (Usando os campos que você salva no AddRegistro)
                        const infoSimulado = reg.simulado
                            ? `${reg.simulado.orgao} / ${reg.simulado.cargo} / ${reg.simulado.banca}`
                            : "Dados do simulado não encontrados";

                        return (
                            <div className='element-faixaHistorico' key={reg.id}>
                                <div className='item-infosHistorico'>
                                    <div className='subItem-disciplinaHistorico'>
                                        <p className='txt-planoHistorico'>{reg.planoNome}</p>
                                        <p className='txt-disciplinaHistorico'>{reg.disciplinaNome}</p>
                                        <p className='txt-topicoHistorico'>{reg.topicoNome}</p>
                                        <p className='txt-subtopicoHistorico'>{reg.subtopicoNome}</p>
                                    </div>

                                    <div className='subItem-estatisticaHistorico'>
                                        <div className='estatisticas-padraoHistorico'>tempo<p>{reg.horaEstudada}</p></div>
                                        <div className='estatisticas-padraoHistorico'>acertos<p>{totalAcertos}</p></div>
                                        <div className='estatisticas-padraoHistorico'>erros<p>{totalErros}</p></div>
                                        <div className='estatisticas-padraoHistorico'>período<p>{reg.periodo}</p></div>
                                    </div>

                                    <div className='subItem-tiposEstudosHistorico'>
                                        {reg.tiposEstudo?.map((tipo, index) => (
                                            <button className='btnTiposEstudos-padraoHistorico' key={index}>{tipo}</button>
                                        ))}
                                    </div>

                                    <div className='subItem-opcoesHistorico'>
                                        <span className='material-icons delete-opcoesHistorico' onClick={() => deletarRegistro(reg.id)}>delete</span>
                                        <span className='material-icons edit-opcoesHistorico' onClick={() => abrirEdicao(reg)}>edit</span>
                                    </div>
                                </div>

                                {/* EXIBIÇÃO DO SIMULADO BASEADO NA LÓGICA CORRIGIDA */}
                                {temSimulado && (
                                    <div className='item-simuladoHistorico'>
                                        <div className='simulado-historico'>
                                            simulado: {infoSimulado}
                                        </div>
                                    </div>
                                )}

                                <div className='item-comentarioHistorico'>
                                    <p>comentários</p>
                                    <div className='comentario-historico'>
                                        {reg.comentario || <span className='sem-comentario'>sem observações...</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}

            {Object.keys(registrosAgrupados).length === 0 && (
                <div style={{padding: '10px', margin: 'auto', opacity: '0.5', fontSize: 'var(--font-titulo)', fontStyle: 'italic'}}>nenhum registro foi encontrado...</div>
            )}
        </div>
    )
}

export default HistoricoPage
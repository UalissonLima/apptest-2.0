import React, { useState, useEffect } from 'react'
import "./addRegistro.css"
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc } from "firebase/firestore";

function AddRegistro({ dataAtual, tempoTotal, fecharModal, zerarCronometro, dadosEdicao }) {
    const [listaPlanos, setListaPlanos] = useState([]);
    const [listaDisciplinas, setListaDisciplinas] = useState([]);
    const [listaTopicos, setListaTopicos] = useState([]);
    const [listaSubtopicos, setListaSubtopicos] = useState([]);

    // Estados dos Inputs Principais
    const [data, setData] = useState(dadosEdicao?.data || dataAtual);
    const [hora, setHora] = useState(dadosEdicao?.horaEstudada || tempoTotal);
    const [periodo, setPeriodo] = useState(dadosEdicao?.periodo || (() => {
        const h = new Date().getHours();
        if (h >= 6 && h < 12) return 'manhã';
        if (h >= 12 && h < 18) return 'tarde';
        if (h >= 18 && h < 24) return 'noite';
        return 'madrugada';
    })());

    const [planoSel, setPlanoSel] = useState(dadosEdicao?.planoId || '');
    const [disciplinaSel, setDisciplinaSel] = useState(dadosEdicao?.disciplinaId || '');
    const [topicoSel, setTopicoSel] = useState(dadosEdicao?.topicoId || '');
    const [subtopicoSel, setSubtopicoSel] = useState(dadosEdicao?.subtopicoId || '');
    const [opcoesSelecionadas, setOpcoesSelecionadas] = useState(dadosEdicao?.tiposEstudo || []);

    // Estados de Performance (Questões e Simulado)
    const [acertos, setAcertos] = useState(dadosEdicao?.questoes?.acertos ?? '');
    const [erros, setErros] = useState(dadosEdicao?.questoes?.erros ?? '');

    // CORREÇÃO: Estado do Simulado individualizado para garantir fluidez no texto
    const [simuOrgao, setSimuOrgao] = useState(dadosEdicao?.simulado?.orgao || '');
    const [simuCargo, setSimuCargo] = useState(dadosEdicao?.simulado?.cargo || '');
    const [simuBanca, setSimuBanca] = useState(dadosEdicao?.simulado?.banca || '');
    const [simuAcertos, setSimuAcertos] = useState(dadosEdicao?.simulado?.acertos ?? '');
    const [simuErros, setSimuErros] = useState(dadosEdicao?.simulado?.erros ?? '');

    const [comentario, setComentario] = useState(dadosEdicao?.comentario || '');

    const validarNumeroPositivo = (valor, callback) => {
        if (valor === "") { callback(""); return; }
        const num = parseInt(valor);
        if (num >= 0) callback(num);
    };

    // BUSCA DE DADOS NO FIREBASE (CASCATA)
    useEffect(() => {
        const q = query(collection(db, "planos"), orderBy("nome", "asc"));
        return onSnapshot(q, (snapshot) => {
            setListaPlanos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, []);

    useEffect(() => {
        if (!planoSel) { setListaDisciplinas([]); return; }
        const q = query(collection(db, "planos", planoSel, "disciplinas"), orderBy("nome", "asc"));
        return onSnapshot(q, (snapshot) => {
            setListaDisciplinas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, [planoSel]);

    useEffect(() => {
        const disc = listaDisciplinas.find(d => d.id === disciplinaSel);
        setListaTopicos(disc?.topicos || []);
    }, [disciplinaSel, listaDisciplinas]);

    useEffect(() => {
        const top = listaTopicos.find(t => t.id === topicoSel);
        setListaSubtopicos(top?.subtopicos || []);
    }, [topicoSel, listaTopicos]);

    const estaAtivo = (opcao) => opcoesSelecionadas.includes(opcao);

    const salvarRegistroGeral = async () => {
        // Validações
        if (!planoSel || !disciplinaSel || !topicoSel) return alert("Selecione Plano, Disciplina e Tópico.");
        if (opcoesSelecionadas.length === 0) return alert("Selecione um Tipo de Estudo.");

        if (estaAtivo('questões') && (acertos === "" || erros === "")) return alert("Preencha acertos/erros em Questões.");

        if (estaAtivo('simulado')) {
            if (!simuOrgao.trim() || !simuCargo.trim() || !simuBanca.trim() || simuAcertos === "" || simuErros === "") {
                return alert("Preencha todos os campos do Simulado.");
            }
        }

        const dadosParaEnviar = {
            data,
            horaEstudada: hora,
            periodo,
            planoId: planoSel,
            planoNome: listaPlanos.find(p => p.id === planoSel)?.nome,
            disciplinaId: disciplinaSel,
            disciplinaNome: listaDisciplinas.find(d => d.id === disciplinaSel)?.nome,
            topicoId: topicoSel,
            topicoNome: listaTopicos.find(t => t.id === topicoSel)?.nome,
            subtopicoId: subtopicoSel || null,
            subtopicoNome: subtopicoSel ? listaSubtopicos.find(s => s.id === subtopicoSel)?.nome : null,
            tiposEstudo: opcoesSelecionadas,
            questoes: estaAtivo('questões') ? { acertos, erros } : null,
            simulado: estaAtivo('simulado') ? { orgao: simuOrgao, cargo: simuCargo, banca: simuBanca, acertos: simuAcertos, erros: simuErros } : null,
            comentario,
            dataRegistro: dadosEdicao ? dadosEdicao.dataRegistro : new Date()
        };

        try {
            if (dadosEdicao) {
                await updateDoc(doc(db, "historico", dadosEdicao.id), dadosParaEnviar);
                alert("Registro atualizado com sucesso!");
            } else {
                await addDoc(collection(db, "historico"), dadosParaEnviar);
                alert("Estudo registrado!");
                if (zerarCronometro) zerarCronometro();
            }
            fecharModal();
        } catch (error) {
            console.error("Erro ao salvar:", error);
        }
    };

    const toggleOpcao = (opcao) => {
        setOpcoesSelecionadas(prev => prev.includes(opcao) ? prev.filter(i => i !== opcao) : [...prev, opcao]);
    };

    return (
        <div className='modal-sobreposicaoRegistro'>
            <div className='container-mainRegistro'>
                {/* SEÇÃO DATA/HORA */}
                <div className='element-dataRegistro'>
                    <div className='item-padraoDataRegistro'>
                        <p>data do estudo</p>
                        <input type="date" className='input-dataRegistro' value={data} onChange={(e) => setData(e.target.value)} />
                    </div>
                    <div className='item-padraoDataRegistro'>
                        <p>tempo</p>
                        <input type="time" className='input-tempoRegistro' value={hora} onChange={(e) => setHora(e.target.value)} />
                    </div>
                    <div className='item-padraoDataRegistro'>
                        <p>período</p>
                        <select className='select-periodoRegistro' value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                            <option value="manhã">manhã</option>
                            <option value="tarde">tarde</option>
                            <option value="noite">noite</option>
                            <option value="madrugada">madrugada</option>
                        </select>
                    </div>
                </div>

                {/* SEÇÃO EDITAL */}
                <div className='box-editalRegistro'>
                    <div className='element-padraoEditalRegistro'>
                        <div className='item-padraoEditalRegistro'>
                            <p>selecione o plano</p>
                            <select className='select-padraoEditalRegistro' value={planoSel} onChange={(e) => { setPlanoSel(e.target.value); setDisciplinaSel(''); }}>
                                <option value="">Selecione...</option>
                                {listaPlanos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                            </select>
                        </div>
                        <div className='item-padraoEditalRegistro'>
                            <p>selecione a disciplina</p>
                            <select className='select-padraoEditalRegistro' value={disciplinaSel} onChange={(e) => { setDisciplinaSel(e.target.value); setTopicoSel(''); }} disabled={!planoSel}>
                                <option value="">Selecione...</option>
                                {listaDisciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className='element-padraoEditalRegistro'>
                        <div className='item-padraoEditalRegistro'>
                            <p>selecione o tópico</p>
                            <select className='select-padraoEditalRegistro' value={topicoSel} onChange={(e) => { setTopicoSel(e.target.value); setSubtopicoSel(''); }} disabled={!disciplinaSel}>
                                <option value="">Selecione...</option>
                                {listaTopicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                            </select>
                        </div>
                        <div className='item-padraoEditalRegistro'>
                            <p>selecione o subtópico (opcional)</p>
                            <select className='select-padraoEditalRegistro' value={subtopicoSel} onChange={(e) => setSubtopicoSel(e.target.value)} disabled={!topicoSel}>
                                <option value="">Nenhum</option>
                                {listaSubtopicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* BOTÕES TIPO ESTUDO */}
                <div className='element-btnEstudosRegistro'>
                    {['vídeo aula', 'leitura', 'anotação', 'revisão', 'questões', 'simulado'].map((opcao) => (
                        <button key={opcao} className={`btn-padraoEstudosRegistro ${estaAtivo(opcao) ? 'btn-selecionadoRegistro' : ''}`} onClick={() => toggleOpcao(opcao)}>{opcao}</button>
                    ))}
                </div>

                {/* SEÇÃO QUESTÕES */}
                {estaAtivo('questões') && (
                    <div className='element-questoesRegistro'>
                        <div className='item-padraoQuestoesRegistro'>
                            <p>acertos</p>
                            <input type="number" min="0" className='input-padraoQuestoesRegistro' value={acertos} onChange={(e) => validarNumeroPositivo(e.target.value, setAcertos)} />
                        </div>
                        <div className='item-padraoQuestoesRegistro'>
                            <p>erros</p>
                            <input type="number" min="0" className='input-padraoQuestoesRegistro' value={erros} onChange={(e) => validarNumeroPositivo(e.target.value, setErros)} />
                        </div>
                    </div>
                )}

                {/* SEÇÃO SIMULADO */}
                {estaAtivo('simulado') && (
                    <div className='element-simuladoRegistro'>
                        <div className='item-infosSimuladoRegistro'>
                            <div className='subItem-padraoInfosSimuladoRegistro'>
                                <p>órgão & ano</p>
                                <input type="text" className='input-padraoInfosSimuladoRegistro' value={simuOrgao} onChange={(e) => setSimuOrgao(e.target.value)} />
                            </div>
                            <div className='subItem-padraoInfosSimuladoRegistro'>
                                <p>cargo</p>
                                <input type="text" className='input-padraoInfosSimuladoRegistro' value={simuCargo} onChange={(e) => setSimuCargo(e.target.value)} />
                            </div>
                            <div className='subItem-padraoInfosSimuladoRegistro'>
                                <p>banca</p>
                                <input type="text" className='input-padraoInfosSimuladoRegistro' value={simuBanca} onChange={(e) => setSimuBanca(e.target.value)} />
                            </div>
                        </div>
                        <div className='item-questoesSimuladoRegistro'>
                            <div className='subItem-questoesSimuladoRegistro'>
                                <p>acertos</p>
                                <input type="number" min="0" className='input-padraoQuestoesSimuladoRegistro' value={simuAcertos} onChange={(e) => validarNumeroPositivo(e.target.value, setSimuAcertos)} />
                            </div>
                            <div className='subItem-questoesSimuladoRegistro'>
                                <p>erros</p>
                                <input type="number" min="0" className='input-padraoQuestoesSimuladoRegistro' value={simuErros} onChange={(e) => validarNumeroPositivo(e.target.value, setSimuErros)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* COMENTÁRIOS */}
                <div className='element-comentarioRegistro'>
                    <p>comentários ({comentario.length.toString().padStart(3, '0')}/500)</p>
                    <textarea className='textarea-comentarioRegistro' maxLength={500} value={comentario} placeholder='digite aqui seu comentário...' onChange={(e) => setComentario(e.target.value)}></textarea>
                </div>

                <div className='element-btnAddRegistro'>
                    <button className='btn-padraoAddRegistro btn-cancelarAddRegistro' onClick={fecharModal}>cancelar</button>
                    <button className='btn-padraoAddRegistro btn-salvarAddRegistro' onClick={salvarRegistroGeral}>
                        {dadosEdicao ? 'atualizar registro' : 'salvar registro'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddRegistro
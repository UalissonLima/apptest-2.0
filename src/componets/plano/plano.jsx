import React, { useState, useEffect } from 'react'
import "./plano.css"
import AddPlano from '../plano/addPlano/addPlano'
import { db } from '../../../src/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";

function Plano({ onSelecionar, selecionadoId }) {
    const [listaPlanos, setListaPlanos] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);

    const planosCollectionRef = collection(db, "planos");

    useEffect(() => {
        const q = query(planosCollectionRef, orderBy("nome", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const dados = snapshot.docs.map((doc) => ({
                ...doc.data(),
                id: doc.id,
            }));
            setListaPlanos(dados);
        });

        return () => unsubscribe();
    }, []);

    const salvarPlano = async (nomeDoEdital) => {
        try {
            await addDoc(planosCollectionRef, {
                nome: nomeDoEdital,
                dataCriacao: new Date()
            });
            setMostrarModal(false);
        } catch (error) {
            console.error("Erro ao salvar plano: ", error);
            alert("Erro ao salvar no banco de dados.");
        }
    };

    const apagarPlano = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Deseja realmente excluir este plano?")) return;

        try {
            const planoDoc = doc(db, "planos", id);
            await deleteDoc(planoDoc);

            if (selecionadoId === id) onSelecionar(null);
        } catch (error) {
            console.error("Erro ao apagar: ", error);
        }
    };

    const lidarComCliquePlano = (plano) => {
        if (selecionadoId === plano.id) {
            onSelecionar(null);
        } else {
            onSelecionar(plano);
        }
    };

    return (
        <div className='container-mainPlano'>
            {mostrarModal && (
                <AddPlano
                    aoSalvar={salvarPlano}
                    aoCancelar={() => setMostrarModal(false)}
                />
            )}

            <div className='element-plano'>
                <div className='item-padraoPlano' onClick={() => setMostrarModal(true)}>
                    <div className='subItem-padraoPlano subItem-addPlano'>
                        <span className='material-icons'>add_circle</span>
                        <p>adicionar plano</p>
                    </div>
                </div>

                {/* VERIFICAÇÃO DE LISTA VAZIA */}
                {listaPlanos.length === 0 ? (
                    <div className='item-padraoPlano'>
                        <div className='subItem-padraoPlano' style={{ border: 'none', background: 'transparent', opacity: '0.5' }}>
                            <p style={{ fontStyle: 'italic', fontSize: 'var(--font-pequena)'}}>
                                nenhum plano foi encontrado...
                            </p>
                        </div>
                    </div>
                ) : (
                    listaPlanos.map((plano) => (
                        <div
                            className='item-padraoPlano'
                            key={plano.id}
                            onClick={() => lidarComCliquePlano(plano)}
                        >
                            <div className={`subItem-padraoPlano  ${selecionadoId === plano.id ? 'subItem-selecionadoPlano' : ''}`}>
                                <p>{plano.nome}</p>
                                <div className='delete-plano' onClick={(e) => apagarPlano(plano.id, e)}>
                                    <span className='material-icons'>delete</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Plano;
import React, { useState } from 'react'
import "./editalPage.css"
import Plano from "../../componets/plano/plano"
import Edital from "../../componets/edital/edital"

function EditalPage() {
    const [planoSelecionado, setPlanoSelecionado] = useState(null);

    return (
        <div className='container-mainEditalPrincipal'>
            {/* Passamos a função de selecionar para o componente Plano */}
            <Plano
                onSelecionar={setPlanoSelecionado}
                selecionadoId={planoSelecionado?.id}
            />

            {/* O Edital só aparece se houver um plano selecionado */}
            {planoSelecionado && (
                <Edital plano={planoSelecionado} key={planoSelecionado.id} />
            )}
        </div>
    )
}

export default EditalPage
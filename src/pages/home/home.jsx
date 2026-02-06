import React from 'react'
import "./home.css"
import Infos from '../../componets/infos/infos'
import Lembretes from '../../componets/lembretes/lembretes'
import Calendario from '../../componets/calendario/calendario'

function Home() {
    return (
        <div className='container-mainHome'>
            <div className='element-infosHome'>
                <Infos />
            </div>
            <div className='element-LemCaleHome'>
                <Lembretes></Lembretes>
                <Calendario></Calendario>
            </div>
        </div>
    )
}

export default Home
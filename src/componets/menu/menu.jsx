import React from 'react'
import "./menu.css"
import { Link } from 'react-router-dom'

function Menu() {
    return (
        <menu>
            <h1>appest 2.0</h1>
            <nav>
                <Link to="/home"><li>home</li></Link>
                <Link to="/edital"><li>edital</li></Link>
                <Link to="/historico"><li>histórico</li></Link>
            </nav>
        </menu>
    )
}

export default Menu
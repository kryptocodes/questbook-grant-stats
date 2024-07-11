import React from 'react'
import QuestbookLogo from './assets/logo.svg'


const NavBar = ({children}) => {
        return (
            <header className="navbar
              
            ">
                <div className="p-4                 border-b-2 border-gray-100">
                    <img src={QuestbookLogo} alt="Questbook Logo" className="header__logo" />
                </div>
                {children}
            </header>
        );
}

export default NavBar
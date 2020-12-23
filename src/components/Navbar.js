import React, {useContext} from "react";
import {Link} from "react-router-dom";

import loggedUserContext from "./context/loggedUser";

import "../css/navbar.css";

function Navbar ()
{
    const {loggedUser, setLoggedUser} = useContext (loggedUserContext);

    return (
        <div className = "navbarArea">
            <Link to = "/">
                <div className = "optionIcon">
                    <div className = "iconBox">
                        <img
                        className = "icon"
                        src = {process.env.PUBLIC_URL+"/icon-white.png"}
                        />
                    </div>
                </div>
            </Link>
            <Link to = "/postlist">
                <button className = "option optionLeft">
                    POSTAGENS RECENTES
                </button>
            </Link>
            <Link to = "/postwrite">
                <button className = "option optionCenter">
                    ESCREVER POSTAGEM
                </button>
            </Link>
            <Link to = {loggedUser.hasOwnProperty ("_id") ? "/userinfo/"+loggedUser._id : "/userinfo/nouser"}>
                <button className = "option optionRigth">
                    SEU PERFIL
                </button>
            </Link>
            <div className = "optionBlank"/>
        </div>
    );
}

export default Navbar;
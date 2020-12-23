import React, {useState, useEffect, useContext} from "react";
import {Link} from "react-router-dom";
import api from "../services/api";

import loggedUserContext from "./context/loggedUser";

import "../css/userInfo.css";

function UserInfo ({match})
{
    const {loggedUser, setLoggedUser} = useContext (loggedUserContext);
    const [user, setUser] = useState ({});
    const [loading, setLoading] = useState (false);

    useEffect
    (
        () =>
        {
            let mounted = true;
            const runEffect = async () =>
            {
                if (match.params.id !== "nouser")
                {
                    const _id = match.params.id;
                    setLoading (true);
                    const response = await api.get
                    (
                        "/useridindex",
                        {
                            params:
                            {
                                _id
                            }
                        }
                    );
                    setLoading (false);
                    if (mounted && response.data !== null)
                    {
                        setUser (response.data);
                    }
                }
                else
                {
                    setUser ({});
                }
            }
            runEffect();
            return (() => {mounted = false;});
        },
        [match]
    );

    function convertDate (value)
    {
        value = value.split ("-");
        var other = value[2].split ("T");
        return (other[0]+"/"+value[1]+"/"+value[0]);
    }

    return (
        <div className = "userInfoArea">
            {
                user.hasOwnProperty ("_id") ?
                <div>
                    <div className = "header">
                        <div className = "name">{user.name}</div>
                        {
                            user._id === loggedUser._id ?
                            <Link to = {"/useredit"}>
                                <button className = "buttonEdit">Editar perfil</button>
                            </Link>
                            :
                            <div/>
                        }
                    </div>
                    <div className = "otherInfo">
                        <div>
                            <div className = "score"><b>{user.score}</b>{user.score === 1 ? " ponto" : " pontos"}</div>
                            <div className = "email">{user.email}</div>
                            <div className = "creationDate">{"Perfil criado em "+convertDate (user.creationDate)}</div>
                            <div
                            className = "deactivated"
                            style = {{display: user.deactivated === true ? "block" : "none"}}
                            >
                                {user.deactivated === true ? "Este perfil foi excluído" : ""}
                            </div>
                        </div>
                        <div className = "statusBox">
                            <div className = "quote">“</div>
                            <div className = "status">{user.status}</div>
                            <div className = "quote">”</div>
                        </div>
                    </div>
                </div>
                : match.params.id == "nouser" ?
                <div className = "message">
                    <div className = "text">
                        Parece que você não está em um perfil ainda...
                    </div>
                    <Link to = "/login">
                        <button className = "buttonLogin">Registre-se ou entre</button>
                    </Link>
                </div>
                :
                <div/>
            }
            {loading ? <div className = "loadingCover"/> : <></>}
        </div>
    )
}

export default UserInfo;
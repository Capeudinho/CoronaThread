import React, {useState, useEffect, useContext} from "react";
import {Link, Redirect} from "react-router-dom";
import api from "../services/api";

import loggedUserContext from "./context/loggedUser";
import TextareaAutosize from 'react-textarea-autosize';

import "../css/userEdit.css";

function UserEdit ({match})
{
    const {loggedUser, setLoggedUser} = useContext (loggedUserContext);
    const [name, setName] = useState ("");
    const [email, setEmail] = useState ("");
    const [password, setPassword] = useState ("");
    const [status, setStatus] = useState ("");
    const [validName, setValidName] = useState (true);
    const [validEmail, setValidEmail] = useState (true);
    const [validPassword, setValidPassword] = useState (true);
    const [show, setShow] = useState (false);
    const [deactivateConfirm, setDeactivateConfirm] = useState (false);
    const [logoutConfirm, setLogoutConfirm] = useState (false);
    const [message, setMessage] = useState (false);
    const [redirect, setRedirect] = useState (<></>);
    const [loading, setLoading] = useState (false);

    useEffect
    (
        () =>
        {
            if (loggedUser.hasOwnProperty ("_id"))
            {
                setName (loggedUser.name);
                setEmail (loggedUser.email);
                setPassword (loggedUser.password);
                setStatus (loggedUser.status);
            }
        },
        [loggedUser]
    );

    function checkName (name)
    {
        if (name.length > 0 && name.length < 20)
        {
            setValidName (true);
            return true;
        }
        setValidName (false);
        return false;
    }

    function checkEmail (email)
    {
        const regularExpression = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (regularExpression.test (String (email).toLowerCase ()))
        {
            setValidEmail (true);
            return true;
        }
        setValidEmail (false);
        return false;
    }

    function checkPassword (password)
    {
        if (password.length > 0)
        {
            setValidPassword (true);
            return true;
        }
        setValidPassword (false);
        return false;
    }

    function handleChangeName (e)
    {
        const value = e.target.value;
        checkName (value);
        setName (value);
    }

    function handleChangeEmail (e)
    {
        const value = e.target.value;
        checkEmail (value);
        setEmail (value);
    }

    function handleChangePassword (e)
    {
        const value = e.target.value;
        checkPassword (value);
        setPassword (value);
    }

    function handleChangeStatus (e)
    {
        const value = e.target.value;
        setStatus (value);
    }

    async function handleSubmit ()
    {
        if (checkName (name) && checkEmail (email) && checkPassword (password))
        {
            setLoading (true);
            const response = await api.put
            (
                "/useridupdate",
                {
                    name,
                    email,
                    password,
                    status
                },
                {
                    params:
                    {
                        _id: loggedUser._id
                    }
                }
            );
            setLoading (false);
            if (response.data === null)
            {
                setMessage ("Já existe uma conta com esse e-mail.");
            }
            else
            {
                setLoggedUser (response.data);
                setMessage ("Sua conta foi atualizada.");
            }
        }
    }

    function handleClear ()
    {
        localStorage.clear ();
        setMessage ("Os dados de sua conta foram removidos do navegador.");
    }

    function handleLogout ()
    {
        if (logoutConfirm)
        {
            localStorage.clear ();
            setLoggedUser ({});
            setRedirect (<Redirect to = "/"/>);
        }
        else
        {
            setLogoutConfirm (true);
        }
    }

    async function handleDeactivate ()
    {
        if (deactivateConfirm)
        {
            setLoading (true);
            const response = await api.put
            (
                "/useridupdatedeactivate",
                {},
                {
                    params:
                    {
                        _id: loggedUser._id
                    }
                }
            );
            setLoading (false);
            if (response.data._id === loggedUser._id)
            {
                localStorage.clear ();
                setLoggedUser ({});
                setRedirect (<Redirect to = "/"/>);
            }
        }
        else
        {
            setDeactivateConfirm (true);
        }
    }

    return (
        <div className = "userEditArea">
            {
                loggedUser.hasOwnProperty ("_id") ?
                <>
                    <div className = "inputGroup">
                        <label>Nome</label>
                        <input
                        placeholder = "Nome"
                        value = {name}
                        style = {{borderColor: validName ? "#acbfe5" : "#cc5151"}}
                        onChange = {(e) => {handleChangeName (e)}}
                        />
                    </div>
                    <div className = "inputGroup">
                        <label>E-mail</label>
                        <input
                        placeholder = "E-mail"
                        value = {email}
                        style = {{borderColor: validEmail ? "#acbfe5" : "#cc5151"}}
                        onChange = {(e) => {handleChangeEmail (e)}}
                        />
                    </div>
                    <div className = "inputGroup passwordInputGroup">
                        <label>Senha</label>
                        <input
                        className = "inputPassword"
                        placeholder = "Senha"
                        value = {password}
                        style = {{borderColor: validPassword ? "#acbfe5" : "#cc5151"}}
                        onChange = {(e) => {handleChangePassword (e)}}
                        type = {show ? "text" : "password"}
                        />
                        <button
                        className = "buttonShow"
                        type = "button"
                        onMouseDown = {() => {setShow (true)}}
                        onMouseUp = {() => {setShow (false)}}
                        >
                            Mostrar
                        </button>
                    </div>
                    <div className = "inputGroup statusInputGroup">
                        <label className = "statusLabel">Status</label>
                        <TextareaAutosize
                        className = "statusInput TextareaAutosize"
                        placeholder = "Status"
                        value = {status}
                        onChange = {(e) => {handleChangeStatus (e)}}
                        />
                    </div>
                    <div className = "buttons">
                        <button
                        className = "buttonSubmit"
                        onClick = {() => {handleSubmit ()}}
                        >
                            Salvar mudanças
                        </button>
                        <div/>
                        <button
                        className = "buttonClear"
                        type = "button"
                        onClick = {() => {handleClear ()}}
                        >
                            Remover dados
                        </button>
                        <button
                        className = "buttonLogout"
                        type = "button"
                        onClick = {() => {handleLogout ()}}
                        >
                            {logoutConfirm ? "Confirmar saída" : "Sair do perfil"}
                        </button>
                        <button
                        className = "buttonDeactivate"
                        type = "button"
                        onClick = {() => {handleDeactivate ()}}
                        >
                            {deactivateConfirm ? "Confirmar exclusão" : "Excluir perfil"}
                        </button>
                    </div>
                    <div
                    className = "message"
                    style = {{display: message.length > 0 ? "block" : "none"}}
                    >
                        {message}
                    </div>
                </>
                :
                <div className = "messageLogin">
                    <div className = "text">
                        Parece que você não está em um perfil ainda...
                    </div>
                    <Link to = "/login">
                        <button className = "buttonLogin">Registre-se ou entre</button>
                    </Link>
                </div>
            }
            {redirect}
            {loading ? <div className = "loadingCover"/> : <></>}
        </div>
    )
}

export default UserEdit;
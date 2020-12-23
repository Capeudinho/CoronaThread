import React, {useState, useEffect, useContext} from "react";
import {Redirect} from "react-router-dom";
import api from "../services/api";

import loggedUserContext from "./context/loggedUser";

import "../css/login.css"

function Login ()
{
    const {loggedUser, setLoggedUser} = useContext (loggedUserContext);
    const [registerName, setRegisterName] = useState ("");
    const [registerEmail, setRegisterEmail] = useState ("");
    const [registerPassword, setRegisterPassword] = useState ("");
    const [loginEmail, setLoginEmail] = useState ("");
    const [loginPassword, setLoginPassword] = useState ("");
    const [validName, setValidName] = useState (true);
    const [validEmail, setValidEmail] = useState (true);
    const [validPassword, setValidPassword] = useState (true);
    const [loginSave, setLoginSave] = useState (false);
    const [registerSave, setRegisterSave] = useState (false);
    const [registerShow, setRegisterShow] = useState (false);
    const [loginShow, setLoginShow] = useState (false);
    const [message, setMessage] = useState ("");
    const [registerCustomStyle, setRegisterCustomStyle] = useState ({backgroundColor: "#ffffff"});
    const [loginCustomStyle, setLoginCustomStyle] = useState ({backgroundColor: "#ffffff"});
    const [redirect, setRedirect] = useState (<></>);
    const [loading, setLoading] = useState (false);

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

    function handleRegisterChangeName (e)
    {
        checkName (e.target.value);
        setRegisterName (e.target.value);
    }

    function handleRegisterChangeEmail (e)
    {
        checkEmail (e.target.value);
        setRegisterEmail (e.target.value);
    }

    function handleRegisterChangePassword (e)
    {
        checkPassword (e.target.value);
        setRegisterPassword (e.target.value);
    }

    function handleRegisterChangeSave ()
    {
        if (!registerSave)
        {
            setRegisterCustomStyle ({backgroundColor: "#99aacc"});
        }
        else
        {
            setRegisterCustomStyle ({backgroundColor: "#e3e3e5"});
        }
        setRegisterSave (!registerSave);
    }

    function handleLoginChangeEmail (e)
    {
        setLoginEmail (e.target.value);
    }

    function handleLoginChangePassword (e)
    {
        setLoginPassword (e.target.value);
    }

    function handleLoginChangeSave ()
    {
        if (!loginSave)
        {
            setLoginCustomStyle ({backgroundColor: "#99aacc"});
        }
        else
        {
            setLoginCustomStyle ({backgroundColor: "#e3e3e5"});
        }
        setLoginSave (!loginSave);
    }

    async function handleRegister ()
    {
        if (checkName (registerName), checkEmail (registerEmail), checkPassword (registerPassword))
        {
            setLoading (true);
            const response = await api.post
            (
                "/userstore",
                {
                    name: registerName,
                    email: registerEmail,
                    password: registerPassword
                }
            );
            setLoading (false);
            if (response.data === "")
            {
                setMessage ("Já existe um perfil com esse e-mail.");
            }
            else
            {
                if (registerSave)
                { 
                    localStorage.setItem ("user", JSON.stringify (response.data));
                }
                setLoggedUser (response.data);
                setRedirect (<Redirect to = "/"/>);
            }
        }
    }

    async function handleLogin ()
    {
        setLoading (true);
        const response = await api.get
        (
            "/userloginindex",
            {
                params:
                {
                    email: loginEmail,
                    password: loginPassword
                }
            }
        );
        setLoading (false);
        if (response.data === null)
        {
            setMessage ("E-mail ou senha está incorreto.");
        }
        else if (response.data === "deactivated")
        {
            setMessage ("Esse perfil foi excuído.");
        }
        else
        {
            if (loginSave)
            {
                localStorage.setItem ("user", JSON.stringify (response.data));
            }
            setLoggedUser (response.data);
            setRedirect (<Redirect to = "/"/>);
        }
    }

    return (
        <div className = "loginArea">
            <div className = "options">
                <div className = "logo">
                    <img
                    className = "icon"
                    src = {process.env.PUBLIC_URL+"/icon.png"}
                    />
                    <div className = "logoTitle"> CoronaThread</div>
                </div>
                <div className = "register">
                    <div className = "title">Registrar</div>
                    <div className = "inputGroup">
                        <label>Nome</label>
                        <input
                        placeholder = "Nome"
                        value = {registerName}
                        style = {{borderColor: validName ? "#acbfe5" : "#cc5151"}}
                        onChange = {(e) => {handleRegisterChangeName (e)}}
                        />
                    </div>
                    <div className = "inputGroup">
                        <label>E-mail</label>
                        <input
                        placeholder = "E-mail"
                        value = {registerEmail}
                        style = {{borderColor: validEmail ? "#acbfe5" : "#cc5151"}}
                        onChange = {(e) => {handleRegisterChangeEmail (e)}}
                        />
                    </div>
                    <div className = "inputGroup passwordInputGroup">
                        <label>Senha</label>
                        <input
                        className = "inputPassword"
                        placeholder = "Senha"
                        value = {registerPassword}
                        style = {{borderColor: validPassword ? "#acbfe5" : "#cc5151"}}
                        onChange = {(e) => {handleRegisterChangePassword (e)}}
                        type = {registerShow ? "text" : "password"}
                        />
                        <button
                        className = "buttonShow"
                        type = "button"
                        onMouseDown = {() => {setRegisterShow (true)}}
                        onMouseUp = {() => {setRegisterShow (false)}}
                        >
                            Mostrar
                        </button>
                    </div>
                    <div className = "saveGroup">
                        <label>Guardar dados</label>
                        <div
                        className = "checkbox"
                        style = {registerCustomStyle}
                        onClick = {() => {handleRegisterChangeSave ()}}
                        onMouseEnter = {() => {registerSave ? setRegisterCustomStyle ({backgroundColor: "#99aacc"}) : setRegisterCustomStyle ({backgroundColor: "#e3e3e5"});}}
                        onMouseLeave = {() => {registerSave ? setRegisterCustomStyle ({backgroundColor: "#acbfe5"}) : setRegisterCustomStyle ({backgroundColor: "#fcfdff"});}}
                        />
                    </div>
                    <button
                    className = "buttonRegister"
                    onClick = {() => handleRegister ()}
                    >
                        Cadastrar-se
                    </button>
                </div>
                <div className = "login">
                    <div className = "title">Entrar</div>
                    <div className = "inputGroup">
                        <label>E-mail</label>
                        <input
                        placeholder = "E-mail"
                        value = {loginEmail}
                        onChange = {(e) => {handleLoginChangeEmail (e)}}
                        />
                    </div>
                    <div className = "inputGroup passwordInputGroup">
                        <label>Senha</label>
                        <input
                        className = "inputPassword"
                        placeholder = "Senha"
                        value = {loginPassword}
                        onChange = {(e) => {handleLoginChangePassword (e)}}
                        type = {loginShow ? "text" : "password"}
                        />
                        <button
                        className = "buttonShow"
                        type = "button"
                        onMouseDown = {() => {setLoginShow (true)}}
                        onMouseUp = {() => {setLoginShow (false)}}
                        >
                            Mostrar
                        </button>
                    </div>
                    <div className = "saveGroup">
                        <label>Guardar dados</label>
                        <div
                        className = "checkbox"
                        style = {loginCustomStyle}
                        onClick = {() => {handleLoginChangeSave ()}}
                        onMouseEnter = {() => {loginSave ? setLoginCustomStyle ({backgroundColor: "#99aacc"}) : setLoginCustomStyle ({backgroundColor: "#e3e3e5"});}}
                        onMouseLeave = {() => {loginSave ? setLoginCustomStyle ({backgroundColor: "#acbfe5"}) : setLoginCustomStyle ({backgroundColor: "#fcfdff"});}}
                        />
                    </div>
                    <button
                    className = "buttonLogin"
                    onClick = {() => handleLogin ()}
                    >
                        Entrar
                    </button>

                </div>
                <div
                className = "message"
                style = {{display: message.length > 0 ? "block" : "none"}}
                >
                    {message}
                </div>
            </div>
            <div className = "image">
                <img
                className = "screenshot"
                src = {process.env.PUBLIC_URL+"/screenshot.png"}
                />
            </div>
            {redirect}
            {loading ? <div className = "loadingCover"/> : <></>}
        </div>
    );
}

export default Login;
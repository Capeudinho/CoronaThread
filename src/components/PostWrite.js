import React, {useState, useContext} from "react";
import {Link, Redirect} from "react-router-dom";
import api from "../services/api";
import TextareaAutosize from 'react-textarea-autosize';

import loggedUserContext from "./context/loggedUser";

import "../css/postWrite.css";

function PostWrite ()
{
    const {loggedUser, setDoggedUser} = useContext (loggedUserContext);
    const [title, setTitle] = useState ("");
    const [text, setText] = useState ("");
    const [tagText, setTagText] = useState ({erase: false, text: ""});
    const [tags, setTags] = useState ([]);
    const [validTitle, setValidTitle] = useState (true);
    const [validText, setValidText] = useState (true);
    const [redirect, setRedirect] = useState (<></>);
    const [update, setUpdate] = useState (0);
    const [loading, setLoading] = useState (false);

    function checkTitle (value)
    {
        if (value.length > 0)
        {
            setValidTitle (true);
            return true;
        }
        setValidTitle (false);
        return false;
    }

    function checkText (value)
    {
        if (value.length > 0)
        {
            setValidText (true);
            return true;
        }
        setValidText (false);
        return false;
    }

    function handleChangeTitle (e)
    {
        const value = e.target.value;
        checkTitle (value);
        setTitle (value);
    }

    function handleChangeText (e)
    {
        var value = e.target.value;
        checkText (value);
        setText (value);
    }

    function handleChangeTagText (e)
    {
        var value = e.target.value;
        if (value[value.length-2] !== "-")
        {
            value = value.replace (" ", "-");
        }
        else
        {
            value = value.replace (" ", "");
        }
        setTagText ({erase: false, text: value});
    }

    function handleChangeTags (e)
    {
        const value = e.key;
        if (value === "Backspace" && tagText.text === "")
        {
            if (tagText.erase === true)
            {
                var newTags = tags;
                newTags.splice (-1, 1);
                setTags (newTags);
                setUpdate (update+1);
            }
            else
            {
                setTagText ({erase: true, text: tagText.text});
            }
        }
        else if (value === "Enter" && tagText.text !== "" && tagText.text[tagText.text.length-1] !== "-")
        {
            const newTags = tags;
            newTags.push (tagText.text.replace (" ", "").toLowerCase ());
            setTags (newTags);
            setTagText ({erase: true, text: ""});
        }
    }

    async function handleSubmit ()
    {
        if (validTitle, validText)
        {
            setLoading (true);
            const response = await api.post
            (
                "/poststore",
                {
                    title,
                    owner: loggedUser._id,
                    tags,
                    text
                }
            );
            setLoading (false);
            if (response.data !== null)
            {
                setRedirect (<Redirect to = {"/postinfo/"+response.data._id}/>);
            }
        }
    }

    return (
        <div className = "postWriteArea">
            {
                loggedUser.hasOwnProperty ("_id") ?
                <div className = "post">
                    <input
                    className = "title"
                    placeholder = "Título"
                    value = {title}
                    onChange = {(e) => {handleChangeTitle (e)}}
                    style = {{borderColor: validTitle ? "#cccccc" : "#cc5151"}}
                    />
                    <TextareaAutosize
                    className = "textInput TextareaAutosize"
                    placeholder = "Texto"
                    value = {text}
                    onChange = {(e) => {handleChangeText (e)}}
                    style = {{borderColor: validText ? "#cccccc" : "#cc5151"}}
                    />
                    <div className = "tagsBox">
                        {
                            tags.map
                            (
                                (tag, index) =>
                                {
                                    return (
                                        <div className = "tag" key = {index}>{tag}</div>
                                    );
                                }
                            )
                        }
                        <input
                        className = "tagText"
                        placeholder = "Tags"
                        value = {tagText.text}
                        onKeyUp = {(e) => {handleChangeTags (e)}}
                        onChange = {(e) => {handleChangeTagText (e)}}
                        />
                    </div>
                    <div className = "bottom">
                        <div>Escreva uma postagem interessante...</div>
                        <button
                        className = "buttonSubmit"
                        onClick = {() => {handleSubmit ()}}
                        >
                            Publicar
                        </button>
                    </div>
                </div>
                :
                <div className = "message">
                    <div className = "text">
                        Você não pode escrever postagens sem um perfil...
                    </div>
                    <Link to = "/login">
                        <button className = "buttonLogin">Registre-se ou entre</button>
                    </Link>
                </div>
            }
            {redirect}
            {loading ? <div className = "loadingCover"/> : <></>}
        </div>
    );
}

export default PostWrite;
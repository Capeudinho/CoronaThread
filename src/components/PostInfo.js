import React, {useState, useEffect, useContext} from "react";
import {Link} from "react-router-dom";
import api from "../services/api";
import TextareaAutosize from 'react-textarea-autosize';

import loggedUserContext from "./context/loggedUser";

import "../css/postInfo.css";

function PostInfo ({match})
{
    const {loggedUser, setDoggedUser} = useContext (loggedUserContext);
    const [post, setPost] = useState ({});
    const [comments, setComments] = useState ([]);
    const [writtenComments, setWrittenComments] = useState ([{parent: "", text: "", edit: false, valid: true}]);
    const [postEdit, setPostEdit] = useState ({active: false});
    const [sort, setSort] = useState ("vote");
    const [update, setUpdate] = useState (0);
    const [loading, setLoading] = useState (false);

    useEffect
    (
        () =>
        {
            let mounted = true;
            const runEffect = async () =>
            {
                const _id = match.params.id;
                setLoading (true);
                const response = await api.get
                (
                    "/postidindex",
                    {
                        params:
                        {
                            _id
                        }
                    }
                );
                const otherResponse = await api.get
                (
                    "/commentlistpag",
                    {
                        params:
                        {
                            post: response.data._id,
                            sort
                        }
                    }
                );
                setLoading (false);
                if (mounted)
                {
                    for (var k = 0; k < response.data.votes.length; k++)
                    {
                        var found = false;
                        if (response.data.votes[k].user === loggedUser._id)
                        {
                            Object.assign (response.data, {voted: response.data.votes[k].type});
                            found = true;
                            k = response.data.votes.length;
                        }
                    }
                    if (found === false)
                    {
                        Object.assign (response.data, {voted: null});
                    }
                    otherResponse.data.map
                    (
                        (comment, index) =>
                        {
                            var found = false;
                            for (var k = 0; k < comment.votes.length; k++)
                            {
                                if (comment.votes[k].user === loggedUser._id)
                                {
                                    Object.assign (otherResponse.data[index], {voted: comment.votes[k].type});
                                    found = true;
                                    k = response.data.votes.length;
                                }
                            }
                            if (found === false)
                            {
                                Object.assign (otherResponse.data[index], {voted: null});
                            }
                        }
                    );
                    setPost (response.data);
                    setComments (otherResponse.data);
                    setWrittenComments ([{parent: response.data._id, text: "", edit: false, valid: true}]);
                    setUpdate (update+1);
                }
            }
            runEffect();
            return (() => {mounted = false;});
        },
        [match, loggedUser]
    );

    function convertDate (value)
    {
        value = value.split ("-");
        var other = value[2].split ("T");
        return (other[0]+"/"+value[1]+"/"+value[0]);
    }

    function checkComment (index)
    {
        var values = [...writtenComments];
        if (values[index].text.length > 0)
        {
            values[index].valid = true;
            setWrittenComments (values);
            return true;
        }
        values[index].valid = false;
        setWrittenComments (values);
        return false;
    }

    function checkPostEditTitle (title)
    {
        if (title.length > 0)
        {
            var value = postEdit;
            value.validTitle = true;
            setPostEdit (value);
            return true;
        }
        var value = postEdit;
        value.validTitle = false;
        setPostEdit (value);
        return false;
    }

    function checkPostEditText (text)
    {
        if (text.length > 0)
        {
            var value = postEdit;
            value.validText = true;
            setPostEdit (value);
            return true;
        }
        var value = postEdit;
        value.validText = false;
        setPostEdit (value);
        return false;
    }

    function findComment (parent)
    {
        var index = null;
        for (var k = 0; k < writtenComments.length; k++)
        {
            if (writtenComments[k].parent === parent)
            {
                index = k;
            }
        }
        return index;
    }

    function handleChangePostEditTitle (e)
    {
        var value = postEdit;
        value.title = e.target.value;
        checkPostEditTitle (value.title);
        setPostEdit (value);
        setUpdate (update+1);
    }

    function handleChangePostEditText (e)
    {
        var value = postEdit;
        value.text = e.target.value;
        checkPostEditText (value.text);
        setPostEdit (value);
        setUpdate (update+1);
    }

    function handleChangePostEditTagText (e)
    {
        var value = postEdit;
        var newtagText = e.target.value;
        if (newtagText[newtagText.length-2] !== "-")
        {
            newtagText = newtagText.replace (" ", "-");
        }
        else
        {
            newtagText = newtagText.replace (" ", "");
        }
        value.tagText.erase = false;
        value.tagText.text = newtagText;
        setPostEdit (value);
        setUpdate (update+1);
    }

    function handleChangePostEditTags (e)
    {
        var value = postEdit;
        const newKey = e.key;
        if (newKey === "Backspace" && postEdit.tagText.text === "")
        {
            if (postEdit.tagText.erase === true)
            {
                var newTags = [...postEdit.tags];
                newTags.splice (-1, 1);
                value.tags = newTags;
                setPostEdit (value);
                setUpdate (update+1);
            }
            else
            {
                value.tagText.erase = true;
                setPostEdit (value);
                setUpdate (update+1);
            }
        }
        else if (newKey === "Enter" && postEdit.tagText.text !== "" && postEdit.tagText.text[postEdit.tagText.text.length-1] !== "-")
        {
            const newTags = [...postEdit.tags];
            newTags.push (postEdit.tagText.text.replace (" ", "").toLowerCase ());
            value.tags = newTags;
            value.tagText.erase = true;
            value.tagText.text = "";
            setPostEdit (value);
            setUpdate (update+1);
        }
    }

    function handleCreateComment (parent, text, edit)
    {
        var values = [...writtenComments];
        values.push ({parent, text, edit, valid: true});
        setWrittenComments (values);
    }

    function handleChangeComment (e, parent)
    {
        for (var k = 0; k < writtenComments.length; k++)
        {
            if (writtenComments[k].parent === parent)
            {
                var values = [...writtenComments];
                values[k].text = e.target.value;
                checkComment (k);
                setWrittenComments (values);
            }
        }
    }

    function handleDeleteComment (parent)
    {
        for (var k = 0; k < writtenComments.length; k++)
        {
            if (writtenComments[k].parent === parent)
            {
                var values = [...writtenComments];
                values.splice (k, 1);
                setWrittenComments (values);
            }
        }
    }

    async function handleChangeSort ()
    {
        if (sort === "date")
        {
            setSort ("vote");
            var newSort = "vote";
        }
        else
        {
            setSort ("date");
            var newSort = "date";
        }
        setLoading (true);
        const response = await api.get
        (
            "/commentlistpag",
            {
                params:
                {
                    post: post._id,
                    sort: newSort
                }
            }
        );
        setLoading (false);
        response.data.map
        (
            (comment, index) =>
            {
                var found = false;
                for (var k = 0; k < comment.votes.length; k++)
                {
                    if (comment.votes[k].user === loggedUser._id)
                    {
                        Object.assign (response.data[index], {voted: comment.votes[k].type});
                        found = true;
                        k = response.data.votes.length;
                    }
                }
                if (found === false)
                {
                    Object.assign (response.data[index], {voted: null});
                }
            }
        );
        setComments (response.data);
        setWrittenComments ([{parent: response.data._id, text: "", edit: false, valid: true}]);
        setUpdate (update+1);
    }

    async function handleSubmitPostEdit ()
    {
        if (checkPostEditTitle (postEdit.title) && checkPostEditText (postEdit.text))
        {
            setLoading (true);
            const response = await api.put
            (
                "/postidupdateedit",
                {
                    title: postEdit.title,
                    text: postEdit.text,
                    tags: postEdit.tags
                },
                {
                    params:
                    {
                        _id: post._id
                    }
                }
            );
            setLoading (false);
            if (response.data !== null)
            {
                setPostEdit ({active: false});
                setPost (response.data);
                setUpdate (update+1);
            }
        }
    }

    async function handleSubmitComment (parent, edit)
    {
        for (var k = 0; k < writtenComments.length; k++)
        {
            if (writtenComments[k].parent === parent && edit === false)
            {
                if (checkComment (k))
                {
                    if (parent === post._id)
                    {
                        var parents = [post._id];
                        var index = -1;
                    }
                    else
                    {
                        for (var j = 0; j < comments.length; j++)
                        {
                            if (comments[j]._id === parent)
                            {
                                var parents = [...comments[j].parents];
                                parents.push (comments[j]._id);
                                var index = j;
                            }
                        }
                    }
                    setLoading (true);
                    const response = await api.post
                    (
                        "/commentstore",
                        {
                            owner: loggedUser._id,
                            parents,
                            text: writtenComments[k].text
                        }
                    );
                    setLoading (false);
                    Object.assign (response.data, {ownerName: loggedUser.name});
                    var newComments = comments;
                    if (index !== -1)
                    {
                        var newWrittenComments = writtenComments;
                        newWrittenComments.splice (k, 1);
                        setWrittenComments (newWrittenComments);
                    }
                    else
                    {
                        var newWrittenComments = writtenComments;
                        newWrittenComments[0].text = "";
                        setWrittenComments (newWrittenComments);
                    }
                    newComments.splice (index+1, 0, response.data);
                    setComments (newComments);
                    setUpdate (update+1);
                }
            }
            else if (writtenComments[k].parent === parent && edit === true)
            {
                if (checkComment (k))
                {
                    setLoading (true);
                    const response = await api.put
                    (
                        "/commentidupdateedit",
                        {
                            text: writtenComments[k].text
                        },
                        {
                            params:
                            {
                                _id: parent
                            }
                        }
                    );
                    setLoading (false);
                    for (var j = 0; j < comments.length; j++)
                    {
                        if (comments[j]._id === parent)
                        {
                            var newComments = comments;
                            newComments[j] = response.data;
                            setComments (newComments);
                            var writingValues = writtenComments;
                            writingValues.splice (k, 1);
                            setWrittenComments (writingValues);
                            setUpdate (update+1);
                        }
                    }
                }
            }
        }
    }

    async function votePost (post, type)
    {
        setLoading (true);
        const response = await api.put
        (
            "/postidupdatevote",
            {
                user: loggedUser._id,
                type: type
            },
            {
                params:
                {
                    _id: post._id
                }
            }
        );
        setLoading (false);
        var newPost = (response.data.newPost);
        Object.assign (newPost, {voted: response.data.voteState});
        setPost (newPost);
        setUpdate (update+1);
    }

    async function voteComment (comment, type, index)
    {
        setLoading (true);
        const response = await api.put
        (
            "/commentidupdatevote",
            {
                user: loggedUser._id,
                type: type
            },
            {
                params:
                {
                    _id: comment._id
                }
            }
        );
        setLoading (false);
        var newComments = comments;
        newComments[index] = response.data.newComment;
        Object.assign (newComments[index], {voted: response.data.voteState});
        setComments (newComments);
        setUpdate (update+1);
    }

    function PostButton ()
    {
        if (post.owner === loggedUser._id)
        {
            if (postEdit.active === false)
            {
                return (
                    <div className = "postButtonGroup">
                        <button
                        className = "buttonEdit"
                        onClick = 
                        {
                            () =>
                            {
                                setPostEdit
                                (
                                    {
                                        title: post.title,
                                        text: post.text,
                                        tags: post.tags,
                                        tagText: {erase: true, text: ""},
                                        active: true,
                                        validTitle: true,
                                        validText: true
                                    }
                                )
                            }
                        }
                        >
                            Editar
                        </button>
                    </div>
                );
            }
            else
            {
                return (
                    <div className = "postEditOptionsGroup">
                        <button
                        className = "buttonDelete"
                        onClick = {() => {setPostEdit ({active: false})}}
                        >
                            Cancelar
                        </button>
                        <button
                        className = "buttonSubmit"
                        onClick = {() => {handleSubmitPostEdit ()}}
                        >
                            Concluir
                        </button>
                    </div>
                );
            }
        }
        else
        {
            return (<div/>);
        }
    }

    function CommentButton ({parent, owner, text})
    {
        var index = null;
        for (var k = 0; k < writtenComments.length; k++)
        {
            if (writtenComments[k].parent === parent)
            {
                index = k;
            }
        }
        if (index !== null)
        {
            return (
                <div className = "replyOptionsGroup">
                    <button
                    className = "buttonDelete"
                    onClick = {() => {handleDeleteComment (parent)}}
                    >
                        Cancelar
                    </button>
                    <button
                    className = "buttonSubmit"
                    onClick = {() => {handleSubmitComment (parent, writtenComments[index].edit)}}
                    >
                        Concluir
                    </button>
                </div>
            );
        }
        else if (owner === loggedUser._id)
        {
            return (
                <div className = "replyOptionsGroup">
                    <button
                    className = "buttonCreate"
                    onClick = {() => {handleCreateComment (parent, text, true)}}
                    >
                        Editar
                    </button>
                    <button
                    className = "buttonCreate"
                    onClick = {() => {handleCreateComment (parent, "", false)}}
                    >
                        Responder
                    </button>
                </div>
            );
        }
        else
        {
            return (
                <button
                className = "buttonCreate"
                onClick = {() => {handleCreateComment (parent, "", false)}}
                >
                    Responder
                </button>
            );
        }
    }

    return (
        <div className = "postInfoArea">
            {
                post.hasOwnProperty ("_id") ?
                <div
                className = "post"
                >
                    <div className = "postHeader">
                        {
                            postEdit.active === false ?
                            <div className = "title">{post.title}</div>
                            :
                            <input
                            className = "titleInput postEditTitleInput"
                            placeholder = "Título"
                            style = {{borderColor: postEdit.validTitle ? "#cccccc" : "#cc5151"}}
                            value = {postEdit.title}
                            onChange = {(e) => {handleChangePostEditTitle (e)}}
                            />
                        }
                    </div>
                    {
                        postEdit.active === false ?
                        <p className = "text">{post.text}</p>
                        :
                        <TextareaAutosize
                        className = "textInput postEditTextInput TextareaAutosize"
                        placeholder = "Texto"
                        style = {{borderColor: postEdit.validText ? "#cccccc" : "#cc5151"}}
                        value = {postEdit.text}
                        onChange = {(e) => {handleChangePostEditText (e)}}
                        />
                    }
                    {
                        postEdit.active === false ?
                        <div className = "postFooter">
                            <PostButton/>
                            <div className = "tags">
                                {
                                    post.tags.map
                                    (
                                        (tag, index) =>
                                        {
                                            return (
                                                <div
                                                className = "tag"
                                                key = {index}
                                                >
                                                    {tag}
                                                </div>
                                            );
                                        }
                                    )
                                }
                            </div>
                            <div className = "creationDate">{"Em "+convertDate (post.creationDate)}</div>
                            <div
                            className = "editionDate"
                            style = {{display: post.editionDate !== null ? "block" : "none"}}
                            >
                                {post.editionDate !== null ? "Editado em "+convertDate (post.editionDate) : ""}
                            </div>
                            <Link className = "owner" to = {"/userinfo/"+post.owner}>{"Por "+post.ownerName}</Link>
                            {
                                loggedUser.hasOwnProperty ("_id") ?
                                <div
                                className = "upvote"
                                style = {{borderBottomColor: post.voted === true ? "#28cc28" : "#999999"}}
                                onClick = {() => {votePost (post, true)}}
                                />
                                :
                                <div
                                className = "upvote"
                                style = {{borderBottomColor: "#cccccc", cursor: "default"}}
                                />
                            }
                            <div className = "score">{post.score}</div>
                            {
                                loggedUser.hasOwnProperty ("_id") ?
                                <div
                                className = "downvote"
                                style = {{borderTopColor: post.voted === false ? "#cc5151" : "#999999"}}
                                onClick = {() => {votePost (post, false)}}
                                />
                                :
                                <div
                                className = "downvote"
                                style = {{borderTopColor: "#cccccc", cursor: "default"}}
                                />
                            }
                        </div>
                        :
                        <div>
                            <div className = "tagsBox">
                                {
                                    postEdit.tags.map
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
                                value = {postEdit.tagText.text}
                                onKeyUp = {(e) => {handleChangePostEditTags (e)}}
                                onChange = {(e) => {handleChangePostEditTagText (e)}}
                                />
                            </div>
                            <PostButton/>
                        </div>
                    }
                </div>
                :
                <div/>
            }
            <div className = "commentSection">
                {
                    loggedUser.hasOwnProperty ("_id") ?
                    <>
                        <div className = "horizontalLine"/>
                        <div className = "mainComment">
                            <TextareaAutosize
                            className = "commentInput TextareaAutosize"
                            placeholder = "Texto"
                            style = {{borderColor: writtenComments[0].valid ? "#cccccc" : "#cc5151"}}
                            value = {writtenComments[0].text}
                            onChange = {(e) => {handleChangeComment (e, post._id)}}
                            />
                            <div className = "mainCommentBottom">
                                <div>Escreva sua opinião sobre esse assunto...</div>
                                <button
                                className = "buttonSubmit"
                                onClick = {() => {handleSubmitComment (post._id, false)}}
                                >
                                    Concluir
                                </button>
                            </div>
                        </div>
                    </>
                    :
                    <></>
                }
                <div className = "buttonGroup">
                    <button
                    className = "buttonSort"
                    onClick = {() => {handleChangeSort ()}}
                    >
                        {sort === "date" ? "Mais recente" : "Maior pontuação"}
                    </button>
                </div>
                <div
                className = "commentList"
                style = {{display: comments.length !== 0 ? "block" : "none"}}
                >
                    {
                        comments.map
                        (
                            (comment, index) =>
                            {
                                return (
                                    <div className = "comment" key = {["A", index]}>
                                        <div className = "commentMain">
                                            <div className = "spaceGroup">
                                                {
                                                    comment.parents.map 
                                                    (
                                                        (parent, otherIndex) =>
                                                        {
                                                            if (otherIndex !== 0)
                                                            {
                                                                return (
                                                                <div
                                                                className = "space"
                                                                key = {otherIndex}
                                                                style =
                                                                {
                                                                    {
                                                                        paddingBottom:
                                                                        comments[index] !== undefined &&
                                                                        comments[index+1] !== undefined &&
                                                                        otherIndex+1 > comments[index+1].parents.length &&
                                                                        comments[index].parents.length > comments[index+1].parents.length ?
                                                                        "20px" : "0px"
                                                                    }
                                                                }
                                                                >
                                                                    <div className = "line"/>
                                                                </div>
                                                                );
                                                            }
                                                        }
                                                    )
                                                }
                                            </div>
                                            <div
                                            className = "commentBox"
                                            style =
                                            {
                                                {
                                                    marginBottom:
                                                    index+1 === comments.length ?
                                                    "0px" : "20px"
                                                }
                                            }
                                            >
                                                <p className = "commentText">{comment.text}</p>
                                                <div>
                                                    <div className = "footer">
                                                        <div className = "footerInfo">
                                                            {
                                                                loggedUser.hasOwnProperty ("_id") ?
                                                                <div
                                                                className = "upvote"
                                                                style = {{borderBottomColor: comment.hasOwnProperty ("voted") && comment.voted === true ? "#28cc28" : "#999999"}}
                                                                onClick = {() => {voteComment (comment, true, index)}}
                                                                />
                                                                :
                                                                <div
                                                                className = "upvote"
                                                                style = {{borderBottomColor: "#cccccc", cursor: "default"}}
                                                                />
                                                            }
                                                            <div className = "score">{comment.score}</div>
                                                            {
                                                                loggedUser.hasOwnProperty ("_id") ?
                                                                <div
                                                                className = "downvote"
                                                                style = {{borderTopColor: comment.hasOwnProperty ("voted") && comment.voted === false ? "#cc5151" : "#999999"}}
                                                                onClick = {() => {voteComment (comment, false, index)}}
                                                                />
                                                                :
                                                                <div
                                                                className = "downvote"
                                                                style = {{borderTopColor: "#cccccc", cursor: "default"}}
                                                                />
                                                            }
                                                            <Link className = "owner" to = {"/userinfo/"+comment.owner}>{"Por "+comment.ownerName}</Link>
                                                            <div className = "creationDate">{"Em "+convertDate (comment.creationDate)}</div>
                                                            <div
                                                            className = "editionDate"
                                                            style = {{display: comment.editionDate !== null ? "block" : "none"}}
                                                            >
                                                                {comment.editionDate !== null ? "Editado em "+convertDate (comment.editionDate) : ""}
                                                            </div>
                                                        </div>
                                                        {
                                                            loggedUser.hasOwnProperty ("_id") ?
                                                            <CommentButton parent = {comment._id} owner = {comment.owner} text = {comment.text}/>
                                                            :
                                                            <></>
                                                        }
                                                    </div>
                                                    {
                                                        [0].map
                                                        (
                                                            (value, otherIndex) =>
                                                            {
                                                                const result = findComment (comment._id);
                                                                if (result !== null)
                                                                {
                                                                    return (
                                                                        <TextareaAutosize
                                                                        className = "commentInput TextareaAutosize"
                                                                        placeholder = "Texto"
                                                                        style = {{borderColor: writtenComments[result].valid ? "#cccccc" : "#cc5151"}}
                                                                        value = {writtenComments[result].text}
                                                                        key = {otherIndex}
                                                                        onChange = {(e) => {handleChangeComment (e, comment._id)}}
                                                                        />
                                                                    );
                                                                }
                                                                else
                                                                {
                                                                    return (<div key = {otherIndex}/>);
                                                                }
                                                            }
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        )
                    }
                </div>
            </div>
            {loading ? <div className = "loadingCover"/> : <></>}
        </div>
    );
}

export default PostInfo;
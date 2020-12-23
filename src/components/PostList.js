import React, {useState, useEffect, useContext} from "react";
import {Link} from "react-router-dom";
import api from "../services/api";

import loggedUserContext from "./context/loggedUser";

import "../css/postList.css";

function PostList ()
{
    const {loggedUser, setLoggedUser} = useContext (loggedUserContext);
    const [posts, setPosts] = useState ([]);
    const [page, setPage] = useState (1);
    const [pageLimit, setPageLimit] = useState (1);
    const [title, setTitle] = useState ("");
    const [user, setUser] = useState ("");
    const [tagText, setTagText] = useState ({erase: false, text: ""});
    const [tags, setTags] = useState ([]);
    const [lastUsedValues, setLastUsedValues] = useState ({title: "", user: "", tags: []});
    const [sort, setSort] = useState ("date");
    const [update, setUpdate] = useState (0);
    const [otherUpdate, setOtherUpdate] = useState (0);
    const [loading, setLoading] = useState (false);

    useEffect
    (
        () =>
        {
            let mounted = true;
            const runEffect = async () =>
            {
                setLoading (true);
                var response = await api.get
                (
                    "/postlistpag",
                    {
                        params:
                        {
                            page,
                            title: lastUsedValues.title,
                            user: lastUsedValues.user,
                            tags: lastUsedValues.tags,
                            sort
                        }
                    }
                );
                setLoading (false);
                if (mounted)
                {
                    response.data.docs.map
                    (
                        (post, index) =>
                        {
                            var found = false;
                            for (var k = 0; k < post.votes.length; k++)
                            {
                                if (post.votes[k].user === loggedUser._id)
                                {
                                    Object.assign (response.data.docs[index], {voted: post.votes[k].type});
                                    found = true;
                                    k = response.data.docs[index].votes.length;
                                }
                            }
                            if (found === false)
                            {
                                Object.assign (response.data.docs[index], {voted: null});
                            }
                        }
                    );
                    setPageLimit (response.data.pages);
                    setPosts ([...posts, ...response.data.docs]);
                }
            }
            runEffect ();
            return (() => {mounted = false;});
        },
        [page, update, loggedUser]
    );

    function convertDate (value)
    {
        value = value.split ("-");
        var other = value[2].split ("T");
        return (other[0]+"/"+value[1]+"/"+value[0]);
    }

    function limitText (value)
    {
        var newText = value.substring (0, 444);
        if (value !== newText)
        {
            newText = newText+" (...)";
        }
        return newText;
    }

    function handleChangeTitle (e)
    {
        const value = e.target.value;
        setTitle (value);
    }

    function handleChangeUser (e)
    {
        const value = e.target.value;
        setUser (value);
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
                setOtherUpdate (otherUpdate+1);
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

    function handleChangeSort ()
    {
        if (sort === "date")
        {
            setSort ("vote");
        }
        else
        {
            setSort ("date");
        }
        setPosts ([]);
        if (page !== 1)
        {
            setPage (1);
        }
        else
        {
            setUpdate (update+1);
        }
    }

    function handleChangePage ()
    {
        if (page < pageLimit)
        {
            setPage (page+1);
        }
    }

    function handleSubmit ()
    {
        var newLastUsedValues = lastUsedValues;
        newLastUsedValues.title = title;
        newLastUsedValues.user = user;
        newLastUsedValues.tags = tags;
        setLastUsedValues (newLastUsedValues);
        setPage (1);
        setPosts ([]);
        setUpdate (update+1);
    }

    async function vote (post, type, index)
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
        var newPosts = posts;
        newPosts[index] = response.data.newPost;
        Object.assign (newPosts[index], {voted: response.data.voteState});
        setPosts (newPosts);
        setOtherUpdate (otherUpdate+1);
    }

    return (
        <div className = "postListArea">
            <div className = "searchBar">
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
                <input
                className = "inputUser"
                value = {user}
                onChange = {(e) => handleChangeUser (e)}
                placeholder = "Usuário"
                />
                <div className = "searchBarBottom">
                    <input
                    className = "inputTitle"
                    value = {title}
                    onChange = {(e) => handleChangeTitle (e)}
                    placeholder = "Título"
                    />
                    <button className = "buttonSearch" onClick = {(e) => handleSubmit (e)}>Pesquisar</button>
                </div>
            </div>
            <button
            className = "buttonSort"
            onClick = {() => {handleChangeSort ()}}
            >
                {sort === "date" ? "Mais recente" : "Maior pontuação"}
            </button>
            {
                posts.map
                (
                    (post, index) =>
                    {
                        return (
                            <div
                            className = "post"
                            key = {index}
                            >
                                <Link className = "title" key = {index} to = {`/postinfo/${post._id}`}>{post.title}</Link>
                                <p className = "text">{limitText (post.text)}</p>
                                <div className = "footer">
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
                                        onClick = {() => {vote (post, true, index)}}
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
                                        onClick = {() => {vote (post, false, index)}}
                                        />
                                        :
                                        <div
                                        className = "downvote"
                                        style = {{borderTopColor: "#cccccc", cursor: "default"}}
                                        />
                                    }
                                </div>
                            </div>
                        );
                    }
                )
            }
            <button
            className = "buttonLoadMore"
            style = {{opacity: page === pageLimit ? "0.5" : "1"}}
            onClick = {() => {handleChangePage ()}}>
                Carregar mais
            </button>
            {loading ? <div className = "loadingCover"/> : <></>}
        </div>
    );
}

export default PostList;
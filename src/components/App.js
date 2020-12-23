import React, {useState, useEffect} from "react";
import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";

import "../global.css"
import "../css/app.css"

import Background from "./Background";
import Navbar from "./Navbar";
import Main from "./Main";
import Login from "./Login";
import PostList from "./PostList";
import PostInfo from "./PostInfo";
import PostWrite from "./PostWrite";
import UserInfo from "./UserInfo";
import UserEdit from "./UserEdit";

import loggedUserContext from "./context/loggedUser";

function App ()
{
  const [loggedUser, setLoggedUser] = useState ({});
  const [redirect, setRedirect] = useState (<></>);

  useEffect
  (
    () =>
    {
      if (loggedUser.hasOwnProperty ("_id") === false && localStorage.getItem ("user") !== null)
      {
        const user = JSON.parse (localStorage.getItem ("user"));
        setLoggedUser (user);
      }
    },
    []
  )

  return (
    <BrowserRouter>
      <div className = "App">
        <loggedUserContext.Provider value = {{loggedUser, setLoggedUser}}>
          <Switch>
            <Route path = "/login" component = {Login}/>
            <>
              <Background/>
              <Route path = "/" component = {Navbar}/>
              <div className = "bodyArea">
                <Switch>
                  <Route path = "/postlist" component = {PostList}/>
                  <Route path = "/postinfo/:id" component = {PostInfo}/>
                  <Route path = "/postwrite" component = {PostWrite}/>
                  <Route path = "/userinfo/:id" component = {UserInfo}/>
                  <Route path = "/useredit" component = {UserEdit}/>
                  <Route path = "/" component = {Main}/>
                </Switch>
              </div>
            </>
          </Switch>
        </loggedUserContext.Provider>
      </div>
      {redirect}
    </BrowserRouter>
  );
}

export default App;

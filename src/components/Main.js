import React from "react";

import "../css/main.css";

function Main ()
{
    return (
        <div className = "mainArea">
            <div className = "iconBox">
                <img
                className = "icon"
                src = {process.env.PUBLIC_URL+"/icon.png"}
                />
            </div>
            <div className = "textbox">
                <div className = "title">Bem-vindo ao CoronaThread!</div>
                <p>
                    Este site foi criado para o projeto da matéria de LPW do IFPE. Ele tem a finalidade de ser
                    uma rede social para a discussão dos assuntos referentes ao coronavírus. Notícias, casos
                    locais, opiniões, críticas, informações, recomendações, avisos, o que for. Escreva postagens e
                    comentários, siga outras pessoas, e compartilhe suas ideias. É uma pena que ninguém lerá isso,
                    exceto Eugênio, porque este site nunca irá ao ar. De qualquer forma, tente não achar
                    nenhum bug por aí.
                </p>
            </div>
        </div>
    )
}

export default Main;
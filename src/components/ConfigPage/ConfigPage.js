import React, { useEffect, useState } from 'react';
import { setToken, isLoggedIn, getStream } from "../../util"
// this is fucked but i can't be bother to fix it yet
import 'regenerator-runtime/runtime';
import "./config.css"

const twitch = window.Twitch.ext;

export default () => {
    
    const [UserId, setUserId] = useState('');
    const [token, setToken] = useState('');
    const [channelId, setChannelId] = useState('')
    const [result, setResult] = useState('')

    useEffect(() => {
        getTwitchData();
    }, []);

    async function getTwitchData() {
        twitch.onAuthorized((auth) => {
            const authedUser = twitch.viewer;
        if (!authedUser.isLinked) {
            return;
        }
            fetch(`https://api.twitch.tv/helix/users?id=${authedUser.id}`, {
                headers: new Headers({'Client-ID':  `${process.env.CLIENTID}`,  "Authorization": `Bearer ${process.env.OAUTH}` })
            })
            .then((res) => res.json())
            .then(res => {
                const [user] = res.data;
                setUserId(user.id) 
                setToken(auth.token)
                setChannelId(auth.channelId)
                fetchQuestions(auth)
            })
        })
    }

    async function fetchQuestions(auth) {
        twitch.rig.log('getting questions', UserId)
        await fetch(`${process.env.ROOT_URL}/channelquestions?channel_id=${auth.channelId}`,{
            method: 'GET',
            headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`})
        })
        .then(data => data.json())
        .then(data => {
            setResult(data.Items)
            console.log(data)
        })
        .catch(err => twitch.rig.log("wtf"))
    }

    async function answerQuestion() {
        await fetch(`${process.env.ROOT_URL}/answer`,{
            method: 'put',
            headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}),
            body: JSON.stringify({
                answer: 'true duude',
                id: '6765705b-04ca-42c3-8e96-a374c8073089'
            })
        })
        .then(data => data.json())
        .then(data => {
            console.log(data)
        })
        .catch(err => twitch.rig.log("wtf"))
    }

    return (
        <div className="container">
        <div>
            <h3 className="title"> Channel Questions Test </h3> 
            <hr />
            <ul className="question-list">
                {/* {Object.entries(result).map(([key, val], i) => (
                <li className="question-item">
                    <h2 className="question-item__question">{val.question}</h2>
                    <div className="row">
                        <p className="question-item__submitted-by">{val.displayName}</p>
                        <button className="question-item__button question-item__answer-button">Answer</button>
                    </div> */}
                    <p className="question-item__answer">answer</p>
                    <div className="question-item__answer-box">
                        <textarea type="text" className="question-item__answer-input"></textarea>
                        <button className="question-item__button question-item__answer-cancel">Cancel</button>
                        <button className="question-item__button question-item__answer-submit" onClick={answerQuestion}>Submit</button>
                    </div>
                {/* </li>
                ))} */}
            </ul>
        </div>
    </div>
    )
}
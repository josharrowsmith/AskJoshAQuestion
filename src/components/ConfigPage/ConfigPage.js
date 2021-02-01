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
                twitch.rig.log(auth.channelId, user.id)
            })
        })
    }

    async function fetchQuestions() {
        twitch.rig.log('getting questions', UserId)
        await fetch(`${process.env.ROOT_URL}/questions?user_id=${UserId}`,{
            method: 'GET',
            headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`})
        })
        .then(data => data.json())
        .then(data => {
            console.log(data)
            twitch.rig.log(data)
        })
        .catch(err => twitch.rig.log("wtf"))
    }

    return (
        <div class="container">
        <div>
            <h3 class="title"> Channel Questions Test </h3> 
            <hr />
            <ul class="question-list">
                <li class="question-item">
                    <h2 class="question-item__question">question</h2>
                    <div class="row">
                        <p class="question-item__submitted-by">Submitted by </p>
                        <img class="question-item__checkmark" v-if="showCheckMark[index]" src="../assets/checkmark.png" />
                        <button class="question-item__button question-item__answer-button">Answer</button>
                    </div>
                    <p class="question-item__answer">answer</p>
                    <div class="question-item__answer-box">
                        <textarea type="text" v-model="answerText[index]" class="question-item__answer-input"></textarea>
                        <button class="question-item__button question-item__answer-cancel">Cancel</button>
                        <button class="question-item__button question-item__answer-submit">Submit</button>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    )
}
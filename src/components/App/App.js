import React, { useEffect, useState } from 'react';
import { setToken, isLoggedIn, getStream } from "../../util"
// this is fucked but i can't be bother to fix it yet
import 'regenerator-runtime/runtime';

const twitch = window.Twitch.ext;
const ROOT_URL = "https://97wdpxpe85.execute-api.us-east-1.amazonaws.com/dev"

export default () => {

    const [UserId, setUserId] = useState('');
    const [token, getToken] = useState('');

    useEffect(() => {
        getTwitchData();
    }, []);

    async function getTwitchData() {
        twitch.onAuthorized((auth) => {
            twitch.rig.log(auth.userId, auth.channelId)
            setUserId(auth.userId)
        })
    }

    async function fetchQuestions() {
        twitch.rig.log('getting questions', UserId)
        await fetch(`${ROOT_URL}/questions?user_id=${UserId}`,{
            method: 'GET',
            headers: new Headers({'Content-Type': 'application/json'})
        })
        .then(data => data.json())
        .then(data => console.log(data))
        .catch(err => twitch.rig.log("wtf"))
        
    }

    return (
        <>
            <h1>Get Questions</h1>
            <p>{UserId}</p>
            <button onClick={fetchQuestions} title="click">Click Me</button>
        </>
    )
}
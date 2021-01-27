import React, { useEffect, useState } from 'react';
import { setToken, isLoggedIn, getStream } from "../../util"
// this is fucked but i can't be bother to fix it yet
import 'regenerator-runtime/runtime';

const twitch = window.Twitch.ext;

export default () => {
    
    const [UserId, setUserId] = useState('');
    const [token, setToken] = useState('');

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
        <>
            <h1>Get Questions</h1>
            <p>{UserId}</p>
            <button onClick={fetchQuestions} title="click">Click Me</button>
        </>
    )
}
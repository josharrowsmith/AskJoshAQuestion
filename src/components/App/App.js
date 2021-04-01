import React, { useEffect, useState } from 'react';
import { setToken, isLoggedIn, getStream } from "../../util"
import { useForm } from "react-hook-form"
// this is fucked but i can't be bother to fix it yet
import 'regenerator-runtime/runtime';
import  "./app.css"

const twitch = window.Twitch.ext;

export default () => {
    
    const [UserId, setUserId] = useState('');
    const [token, setToken] = useState('');
    const [channelId, setChannelId] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [result, setResult] = useState('');
    const [clientId, setClientId] = useState('')
    const [linked, setLinked] = useState(false)
    const { register, handleSubmit, watch, errors } = useForm();  

    useEffect(() => {
        getTwitchData();
        if(linked){
            fetchQuestions()
        }
    }, [UserId]);

    async function getTwitchData() {
        twitch.onAuthorized((auth) => {
            console.log(auth)
            const authedUser = twitch.viewer;
            console.log(authedUser.id)
        if (!authedUser.isLinked) {
            return
        }
        setLinked(true)
        fetch(`https://api.twitch.tv/helix/users?id=${authedUser.id}`, {
                headers: new Headers({"Client-ID":  `${process.env.CLIENTID}`,  "Authorization": `Bearer ${process.env.OAUTH}`}),
                mode: 'cors'
            })
            .then((res) => res.json())
            .then(res => {
                console.log(res)
                twitch.rig.log(res)
                const [user] = res.data;
                setUserId(user.id) 
                setToken(auth.token)
                setChannelId(auth.channelId)
                setDisplayName(user.display_name)
                setClientId(auth.clientId)
            })
            .catch(err =>{
                twitch.rig.log(err)
                console.log(err)
            })
        })
    }

    async function getData() {
        console.log("getting id")
        twitch.rig.log("getting id")
        window.Twitch.ext.actions.requestIdShare();
    }

    async function fetchQuestions() {
        await fetch(`${process.env.ROOT_URL}/questions?user_id=${UserId}`,{
            method: 'GET',
            // headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`})
        })
        .then(data => data.json())
        .then(data => {
            setResult(data)
        })
        .catch(err => twitch.rig.log("wtf"))
    }

    async function AskQuestion(question) {
        console.log(UserId, channelId)
        await fetch(`${process.env.ROOT_URL}/question`, {
            method: 'POST',
            headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}),
            body: JSON.stringify({
                  user_id: `${UserId}`,
                  channel_id: `${channelId}`,
                  question: question,
                  postedToForum: false,
                  displayName: `${displayName}`,
                  clientId: `${clientId}`
            })
        })
        .then(result => result.json())
        .catch(err => twitch.rig.log(err))
        .then(result => fetchQuestions())
    }

    async function onSubmit (data, e) {
        console.log(data.question)
        const result = await AskQuestion(data.question)
        e.target.reset()
    };

    return linked ? (
        <div className="dspClassName">
            <div className="container askQuestion">
                <form onSubmit={handleSubmit(onSubmit)} >
                    <h2 className="title">Ask A Question</h2>
                    <textarea 
                        className="question-input" 
                        placeholder="Ask the broadcaster a question..."
                        name="question"
                        defaultValue=""
                        ref={register({ required: true})}>
                    </textarea>
                    <input className="askQuestionBtn" type="submit" variant="primary" />
                </form>
            </div>
            <div className="container questions">
                <h3 className="title">Previous Questions </h3>
                <ul className="question-list">
                    {!Object.keys(result).length > 0 && (
                         <p className="question-item__question">No Questions found</p>
                    )}
                    {Object.entries(result).map(([key, val], i) => (
                        <li key={key}>
                            <div className="question-item">
                                <p className="question-item__question"><span>Q:</span>{val.question}</p>
                                <p className="question-item__answer"><span>A:</span>{val.answer}</p>
                            </div>
                        </li> 
                    ))}
                </ul>
            </div>
           
        </div>
    ) : (
        <div className="notLinked"> 
            <h1>Please share user Id</h1>
            <input type="submit" className="askQuestionBtn" onClick={getData} variant="primary"/>
        </div>
    )
}
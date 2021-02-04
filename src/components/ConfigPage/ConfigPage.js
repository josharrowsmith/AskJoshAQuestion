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
    const [result, setResult] = useState([])
    const [form, setForm] = useState({ answer: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        await fetch(`${process.env.ROOT_URL}/channelquestions?channel_id=${auth.channelId}`,{
            method: 'GET',
            headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`})
        })
        .then(data => data.json())
        .then(data => {
            const array = Object.values(data.Items)
            setResult(array)
        })
        .catch(err => twitch.rig.log("wtf"))
    }

    async function answerQuestion(id) {
        await fetch(`${process.env.ROOT_URL}/answer`,{
            method: 'put',
            headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}),
            body: JSON.stringify({
                answer: form.answer,
                id: id
            })
        })
        .then(data => data.json())
        .then(data => {
            console.log(data)
        })
        .catch(err => twitch.rig.log("wtf"))
    }

    const handleChange = e => {
        setForm({
          ...form,
          [e.target.name]: e.target.value
        });
    };


    return (
        <div className="container">
            <h3 className="title"> Channel Questions</h3> 
                <>
                {result.length == 0 ? (
                    <h3 className="question-item__question">No Questions found</h3>
                ) : (
                    <ul className="question-list">
                    {result.map((val, i) => (
                        <li className="question-item" key={i}>
                            <h2 className="question-item__question">{val.question}</h2>
                            <div className="row">
                                <p className="question-item__submitted-by">{val.displayName}</p>
                                <button className="question-item__button question-item__answer-button">Answer</button>
                            </div>
                            <p className="question-item__answer">answer</p>
                            <div className="question-item__answer-box">
                                <textarea 
                                    type="text"
                                    className="question-item__answer-input"
                                    onChange={handleChange}
                                    name='answer'>
                                    {val.answer ? val.answer : ""}
                                    </textarea>
                                <button className="question-item__button question-item__answer-cancel">Cancel</button>
                                <button className="question-item__button question-item__answer-submit" onClick={() => answerQuestion(val.id)}>Submit</button>
                            </div>
                        </li>
                        )
                    )}
                </ul> 
                )}
            </>
        </div>
    )
}
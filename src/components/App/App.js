import React, { useEffect, useState } from 'react';
import { setToken, isLoggedIn, getStream } from "../../util"
// this is fucked but i can't be bother to fix it yet
import 'regenerator-runtime/runtime';
import  "./app.css"

const twitch = window.Twitch.ext;

export default () => {
    
    const [UserId, setUserId] = useState('');
    const [token, setToken] = useState('');
    const [channelId, setChannelId] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [form, setForm] = useState({ question: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState("");

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
                headers: new Headers({'Client-ID':  `${process.env.CLIENTID}`,  "Authorization": `Bearer ${process.env.OAUTH}` }),
                mode: 'cors'
            })
            .then((res) => res.json())
            .then(res => {
                const [user] = res.data;
                setUserId(user.id) 
                setToken(auth.token)
                setChannelId(auth.channelId)
                setDisplayName(user.displayName)
                fetchQuestions(user)
            })
        })
    }

    async function fetchQuestions(user) {
        await fetch(`${process.env.ROOT_URL}/questions?user_id=${user.id}`,{
            method: 'GET',
            headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`})
        })
        .then(data => data.json())
        .then(data => {
            setResult(data)
        })
        .catch(err => twitch.rig.log("wtf"))
    }

    async function AskQuestion() {
        fetch(`${process.env.ROOT_URL}/question`, {
            method: 'POST',
            headers: new Headers({'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`}),
            body: JSON.stringify({
                  user_id: `${UserId}`,
                  channel_id: `${channelId}`,
                  question: form.question,
                  postedToForum: false,
                  displayName: displayName
            })
        })
        .then(result => result.json())
        .then(result => twitch.rig.log(result))
    }

    const handleChange = e => {
        setForm({
          ...form,
          [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const result = await AskQuestion();
        console.log(result)
    };

    return (
        <div className="dspClassName">
            <div className="container askQuestion">
                <h2 className="title">Ask A Question</h2>
                <textarea 
                    className="question-input" 
                    placeholder="Ask the broadcaster a question..."
                    name='question'
                    onChange={handleChange}>
                </textarea>
                <div className="toolbar">
                    <button className="askQuestionBtn" onClick={handleSubmit} variant="primary">Submit</button>
                </div>
            </div>
            <div className="container questions">
                <h3 className="title">Previous Questions </h3>
                <ul className="question-list">
                    {!Object.keys(result).length > 0 && (
                         <p className="question-item__question">No Questions found</p>
                    )}
                    {Object.entries(result).map(([key, val], i) => { 
                        // twitch.rig.log(val, i)
                        return (
                        <li key={key}>
                            <div className="question-item">
                                <p className="question-item__question"><span>Q:</span>{val.question}</p>
                                <p className="question-item__answer"><span>A:</span>{val.answer}</p>
                            </div>
                        </li> 
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}
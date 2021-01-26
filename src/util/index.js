import jwt from "jsonwebtoken";

export const setToken = (token, userId) => {
    let isMod = false
    let role = ""
    let user_id = ""
    try {
        let decoded = jwt.decode(token)

        if (decoded.role === 'broadcaster' || decoded.role === 'moderator') {
            isMod = true
        }

        user_id = decoded.user_id
        role = decoded.role
    } catch (e) {
        token = ''
        opaque_id = ''
    }

    return role;

}

export const getStream = (auth, user) => {
    console.log(user)
    fetch(`https://api.twitch.tv/helix/streams`, {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user}`,
        'Client-ID': auth,
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res)
        })
        .catch((err) => console.error('Something broke.', err));
}

export const isLoggedIn = (opaque_id) => {
    return opaque_id[0] === 'U' ? true : false
}

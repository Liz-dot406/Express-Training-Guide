
//login smoke test - using k6
import http, { head } from "k6/http"
import { check, sleep } from "k6"


export const options = {
    vus: 10,
    // iterations: 1,
    duration: "30s",
}

export default () => {
    const url = "http://localhost:3000/login"
    const payload = JSON.stringify({
        email: "bkemboi590@gmail.com",
        password: "mypass123"
    })

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params)
    check(res, {
        "is status 200": (r) => r.status === 200,
        "has token": (r) => {
            return r.json('token') !== undefined
        }
    })
    sleep(1)
}
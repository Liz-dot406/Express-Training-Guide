import http from "k6/http"
import { check, sleep } from "k6"

export const options = {
    vus: 3,
    duration: "30s",
}

export default () => {
    const res = http.get("http://localhost:3000/todos")
    check(res, {
        "is status 200": (r) => r.status === 200,
    })
    sleep(1)
}
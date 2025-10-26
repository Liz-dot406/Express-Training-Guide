import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
    stages: [
        { duration: '10m', target: 200 }, // ramp up to 200 users
        { duration: '20m', target: 200 }, // stay at 200 users
        { duration: '10m', target: 0 },   // ramp down to 0 users
    ]
};

export default () => {
    const res = http.get('http://localhost:3000/todos');
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
}
sleep(1);
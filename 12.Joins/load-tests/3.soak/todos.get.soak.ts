import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
    stages: [
        { duration: '30m', target: 100 }, // ramp up to 50 users
        { duration: '5h', target: 100 },  // stay at 50 users
        { duration: '5m', target: 0 },  // ramp down to 0 users
    ]
};

export default () => {
    const res = http.get('http://localhost:3000/todos');
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(1);
}
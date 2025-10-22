// load testing
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 100 }, // ramp up to 100 users - in real scenario, add time to 5 mins
        { duration: '2m', target: 100 }, // stay at 100 users - in real scenario, add time to 10 mins
        { duration: '30s', target: 0 },  // ramp down to 0 users
    ],
};

export default () => {
    const res = http.get('http://localhost:3000/todos');
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
}

sleep(1);
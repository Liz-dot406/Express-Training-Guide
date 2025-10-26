import http from 'k6/http';
import { check, sleep } from 'k6';

//breakpoint test
export const options = {
    stages: [
        { duration: '2m', target: 10000 }, // ramp up to 10000 users
        { duration: '4m', target: 20000 }, // ramp up to 20000 users
    ]
};

export default () => {
    const res = http.get('http://localhost:3000/todos');
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
    sleep(1);
}
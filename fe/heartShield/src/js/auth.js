import { fetchData } from './fetch.js';
import { createMessage } from './mods.js';

const base = import.meta.env.BASE_URL || '/'

const goTo = (path) => {
  window.location.href = base + path;
};

const loginUser = async (event) => {
    event.preventDefault();

    // Haetaan oikea formi
    const loginForm = document.querySelector('.login-form');

    // Haetaan formista arvot
    const user_email = loginForm.querySelector('#login-email').value.trim();
    const user_password = loginForm.querySelector('#login-password').value.trim();

    // Luodaan body lähetystä varten taustapalvelun vaatimaan muotoon
    const bodyData = {
        email: user_email,
        password: user_password,
    };

    // Endpoint
    const url = 'http://127.0.0.1:3000/api/auth/login';

    // Options
    const options = {
        body: JSON.stringify(bodyData),
        method: 'POST',
        headers: {
        'Content-type': 'application/json',
        },
    };
    console.log(options);
    // Hae data
    const response = await fetchData(url, options);

    if (response.error) {
        console.error('error login', response.error);
        

        const mainBlock = document.querySelector('#login-block');
        const message = await createMessage(response.error);

        mainBlock.appendChild(message);

        return;
    }

    if (response.message) {
        console.log(response.message, 'success');
        localStorage.setItem('token', response.token);
        localStorage.setItem('user_id', response.user.user_id);
        localStorage.setItem('user_type', response.user.user_type);
        localStorage.setItem('user_email', response.user.user_email);

        console.log('USER ID:', response.user.user_id);
    }

    console.log(response);
    const userType = localStorage.getItem('user_type');
    if (userType === 'adm') {
        goTo('src/pages/admin.html');
    } else if (userType === 'pot') {
        goTo('src/pages/patient.html');
    } else if (userType === 'doc') {
        goTo('src/pages/doc.html');
    }
    loginForm.reset(); // tyhjennetään formi
    
};

const logout = async () => {
    localStorage.clear();
    window.location.href = 'index.html';
    
};




export { logout, loginUser };
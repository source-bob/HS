import { fetchData } from './fetch.js';
import { createMessage } from './mods.js';

const loginUser = async (event) => {
    event.preventDefault();

    // Haetaan oikea formi
    const loginForm = document.querySelector('.login-form');

    // Haetaan formista arvot
    const email = loginForm.querySelector('#login-email').value.trim();
    const password = loginForm.querySelector('#login-password').value.trim();

    // Luodaan body lähetystä varten taustapalvelun vaatimaan muotoon
    const bodyData = {
        user_email: email,
        user_password: password,
    };

    // Endpoint
    const url = 'http://localhost:3000/api/auth/login';

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
    }

    console.log(response);
    const userType = localStorage.getItem('user_type');
    if (userType === 'adm') {
        window.location.href = 'src/pages/admin.html';
    } else if (userType === 'pot') {
        window.location.href = 'src/pages/patient.html';
    } else if (userType === 'doc') {
        window.location.href = 'src/pages/doc.html';
    }
    loginForm.reset(); // tyhjennetään formi
    
};

const logout = async () => {
    window.location.href = 'login.html';
    localStorage.clear();
};




export { logout, loginUser };
import { fetchData } from './fetch.js';
import { createMessage } from './mods.js';

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
    const url = 'https://hesh.northeurope.cloudapp.azure.com/api/auth/login';

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
        window.location.href = 'admin.html';
    } else if (userType === 'pot') {
        window.location.href = 'patient.html';
    } else if (userType === 'doc') {
        window.location.href = 'doc.html';
    }
    loginForm.reset(); // tyhjennetään formi
    
};

const logout = async () => {
    localStorage.clear();
    window.location.href = 'index.html';
    
};




export { logout, loginUser };
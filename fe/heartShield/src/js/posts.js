import { fetchData } from "./fetch";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fi-FI', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
    }).replace(',', '');
};

const createMessage = async (message) => {
    
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message-login';
    errorMessage.textContent = message;
    const errorCloseButton = document.createElement('div');
    errorCloseButton.id = 'error-close';
    errorCloseButton.textContent = 'ok';

    errorCloseButton.addEventListener('click', () => {
        errorMessage.style.display = 'none';
    });

    errorMessage.appendChild(errorCloseButton);
    return errorMessage;
};

export { createMessage };
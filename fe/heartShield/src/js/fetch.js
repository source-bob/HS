/**
 * fetches json data from apis
 * 
 * @param {string} url - api endpoint url
 * @param {Object} options - request options, metodit GET default, POST, DELETE
 * 
 * @returns {Object} response json data
 */

const fetchData = async (url, options = {}) => {
    try {
        console.log(url, options);
        const response = await fetch(url, options);

        if(!response.ok) {
            const errorData = await response.json();
            return {error: errorData.message || 'an error occured'};
        }

        return await response.json(); // return successful response data
    } catch (error) {
        console.error('fetchData() error:', error.message);
        return {error: error.message};
    }
};

export { fetchData };
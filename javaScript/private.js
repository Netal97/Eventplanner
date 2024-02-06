document.addEventListener('DOMContentLoaded', function () {

   if (!checkAuthentication()) {
        return;
    }

});

// Checkauth


function checkAuthentication() {
    const authToken = sessionStorage.getItem('authToken');
    

    if (!authToken) {
        window.location.href = '../Frontend/index.html';
        return false; 
    }

    return true; 
}
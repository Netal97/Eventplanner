
//Listener 

const localhost = "http://104.155.0.52:8080";


document.addEventListener('DOMContentLoaded', function () {

    fetchEvents();

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function (event) {
            event.preventDefault();
            logout();
        });
    }

    getUserInformation()
    .then(userData => {
        document.getElementById('username3').value = userData.username;
        document.getElementById('email3').value = userData.email;
        
    })
    .catch(error => {
        console.error('Fehler beim Abrufen von Benutzerinformationen', error);
        throw error;
    });


});


// FormaDate


function formatDate(dateString, format = "YYYY-MM-DD") {
    const dateObject = new Date(dateString);

    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');

    const formattedDate = format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
    return formattedDate;
}


// Registrierung

function submitRegistrationForm(event) {
    event.preventDefault();


    const username = document.getElementById('username').value;
    const email = document.getElementById('email2').value;
    const password = document.getElementById('password2').value;


    const data = {
        username: username,
        email: email,
        password: password
    };


    fetch(`${localhost}/users/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(apiResponse => {
        if (apiResponse.success === 'yes') {
            $('#signupModal').modal('hide');
            document.getElementById('signupForm').reset();
            console.log(apiResponse);
            alert(apiResponse.message);
        } else {
            console.log(apiResponse);
            alert(apiResponse.message);
        }

    })
    .catch(error => {
        console.error('Error:', error);
    });
}



// Login

function submitLoginForm(event) {
    event.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const data = {
        email: email,
        password: password
    };

    fetch(`${localhost}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(apiResponse => {
        if (apiResponse.success === 'yes') {

            $('#loginModal').modal('hide');
            document.getElementById('loginForm').reset();

            sessionStorage.setItem('authToken', apiResponse.token);
            sessionStorage.setItem('userId', apiResponse.userId);
            console.log(apiResponse);
            alert(apiResponse.message); 
            window.location.href = '../Frontend/dashboard.html';

        } else {
            console.log(apiResponse);
            alert(apiResponse.message);
        }
    })
    .catch(error => {
        console.error('Erreur :', error);
    });
}



// Logout 


function logout() {

    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');

    window.location.href = '../Frontend/index.html';
}



// Get Event to List in WebApp



function fetchEvents() {
    fetch(`${localhost}/events`)
        .then(response => response.json())
        .then(events => {
            console.log(events.results);
            displayEvents(events.results);
        })
        .catch(error => console.error('Fehler beim Abrufen von Events:', error));
}

function displayEvents(events) {
    const eventsListDiv = document.getElementById('eventsList');

    eventsListDiv.innerHTML = '';
    eventsListDiv.classList.add('event-list-container');

    events.forEach(event => {

        const eventDiv = document.createElement('div');
        eventDiv.classList.add('event-item');
        eventDiv.style.display = 'flex';
        eventDiv.style.marginBottom = '20px'; 
        
        eventDiv.style.justifyContent = 'space-between';


        const eventInfo = document.createElement('p');
        eventInfo.textContent = `${event.Eventname}, Status: ${event.Eventstatus}`;


        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'Details anzeigen';
        detailsButton.classList.add('btn', 'btn-info', 'ml-2',);


        detailsButton.addEventListener('click', function () {
            displayEventDetailsModal(event);
        });


        eventDiv.appendChild(eventInfo);
        
        eventDiv.appendChild(detailsButton);


        eventsListDiv.appendChild(eventDiv);
    });
}

function displayEventDetailsModal(event) {

    const modalId = `eventDetailsModal-${event.EventID}`;


    const modalContent = `
        <div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="eventDetailsModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="eventDetailsModalLabel">${event.Eventname}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Id: ${event.EventID}</p>
                        <p>Status: ${event.Eventstatus}</p>
                        <p>Host: ${event.UserName}</p>
                        <p>Datum: ${formatDate(event.EventDate, "DD/MM/YYYY")}</p>
                        <p>Uhrzeit: ${event.Starttime} - ${event.Endtime}</p>
                        <p>Beschreibung: ${event.Description}</p>
                        <form id="participate" onsubmit="participationForm(event)">
                            <input type="text" class="form-control" id="eventid" value="${event.EventID}" style="display: none;" required>
                            <button type="submit" class="btn btn-primary">Teilnehmen </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;


    document.body.insertAdjacentHTML('beforeend', modalContent);

    $(`#${modalId}`).modal('show');
}


// Send Participation


function participationForm(event) {
    event.preventDefault();

    const userId = sessionStorage.getItem('userId');
    const eventId = document.getElementById('eventid').value;
    const authToken = sessionStorage.getItem('authToken');

    if (!authToken) {
        alert("Sie müssen angemeldet sein, um an diesem Event teilzunehmen.");
        return;
    }

    fetch(`${localhost}/participants/${userId}/${eventId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);

        alert(result.message);
        window.location.reload();


    })
    .catch(error => {
        if (error && (error.error === 'Already Participated' || error.error === 'Trainer Cannot Participate')) {
            
            alert(error.message);
        } else {
            console.error('Error participating in event:', error);
        }
    });
}


//Search Event


function submitSearchForm(event) {
    event.preventDefault(); 

    const eventId = document.getElementById('eventId').value;

    fetch(`${localhost}/events/${eventId}`)
        .then(response => response.json())
        .then(eventData => {
            if (eventData) {
                if(eventData.success === 'yes'){
                    //currentEventId = eventData.results.EventID;
                    console.log(eventData.results);
                    console.log(eventData.message);
                    displayEventModal(eventData.results);
                    $('#searchModal').modal('toggle');
                    document.getElementById('eventId').value = ''
                }else{
                    alert(eventData.message);
                }

            } else {
                alert('Event nicht gefunden!');

            }
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Eventdaten:', error);
        });
}

function displayEventModal(eventData) {
    const modalContent = `
    <div class="modal fade" id="eventDetailsModal" tabindex="-1" role="dialog" aria-labelledby="eventDetailsModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="eventDetailsModalLabel">${eventData.Eventname}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>Id: ${eventData.EventID}</p>
                    <p>Status: ${eventData.Eventstatus}</p>
                    <p>Host: ${eventData.UserName}</p>
                    <p>Datum: ${formatDate(eventData.EventDate)}</p>
                    <p>Uhrzeit: ${eventData.Starttime} - ${eventData.Endtime}</p>
                    <p>Beschreibung: ${eventData.Description}</p>
                    
                    <form id="participate" onsubmit="participationForm(event)">
                        <input type="text" class="form-control" id="eventid" value="${eventData.EventID}" style="display: none;" required>
                        <button type="submit" class="btn btn-primary">Teilnehmen </button>
                    </form>
                
                </div>
            </div>
        </div>
    </div>
    `;

   
    document.body.insertAdjacentHTML('beforeend', modalContent);


    
    $('#eventDetailsModal').modal('show');
    
}


// Create Event

function getCurrentDateTime() {
    const currentDateTime = new Date();
    const formattedDateTime = currentDateTime.toISOString().replace(/T/, ' ').replace(/\..+/, '');

    return formattedDateTime;
}


function createEvent25(event) {

    event.preventDefault(); 

    console.log('Form submitted!');

    const authToken = sessionStorage.getItem('authToken');

    if (!authToken) {
        alert('Sie müssen angemeldet sein, um ein Event zu erstellen!');
        return;
    }


    
    const userId = sessionStorage.getItem('userId');
    const eventName = document.getElementById('eventName').value;
    const createDate = getCurrentDateTime();
    const eventDate = document.getElementById('eventDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const eventStatus = document.getElementById('eventStatus').value;
    const eventDescription = document.getElementById('eventDescription').value;

    const data = {
        userId: userId,
        eventname: eventName,
        createDate: createDate,
        eventDate: eventDate,
        startTime: startTime,
        endTime: endTime,
        eventStatus: eventStatus,
        description: eventDescription
    };


    fetch(`${localhost}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` 
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(apiResponse => {
        if (apiResponse.success === 'yes') {
            $('#createEventModal').modal('hide');
            document.getElementById('createEventForm').reset();
            console.log(apiResponse);
            alert(apiResponse.message);

        } else {
            console.log(apiResponse);
            alert(apiResponse.error);
        }
    })
    .catch(error => {
        console.error('Fehler :', error);
    });


}


// Get User Information

function getUserInformation() {

    const userId = sessionStorage.getItem('userId');

    return fetch(`${localhost}/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` 
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log('User Information:', data.userInformation);
        return data.userInformation;
    })

    .catch(error => {
        console.error('Fehler beim Abrufen von Benutzerinformationen', error);
        throw error;
    });

}


// Update User Information


function updateProfile(event) {
    event.preventDefault();

    const newUsername = document.getElementById('username3').value;
    const newEmail = document.getElementById('email3').value;
    const userId = sessionStorage.getItem('userId');

    const data = {
        username: newUsername,
        email: newEmail,
    };


    fetch(`${localhost}/users/edit/${userId}`, {
        method: 'PUT', 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}` 
        },
        body: JSON.stringify(data),
    })
    .then(response=> response.json())
    .then(result => {
        $('#profileModal').modal('hide');
        console.log(result);
        alert(result.message);  

    })
    .catch(error => {
        console.error('Fehler beim Aktualisieren des Profils', error);
    });
};


// Seiten verwalten 

const meineEventsLink = document.querySelector('#navbarNav a[href="#meineEventsContent"]');
const termineLink = document.querySelector('#navbarNav a[href="#termineContent"]');

const meineEventsContent = document.getElementById('meineEventsContent');
const termineContent = document.getElementById('termineContent');
const eventsContainer2 = document.getElementById('eventcontainer2');

meineEventsContent.style.display = 'none';
termineContent.style.display = 'none';

meineEventsLink.addEventListener('click', function (event) {
    event.preventDefault();
    meineEventsContent.style.display = 'block';
    termineContent.style.display = 'none';
    eventsContainer2.style.display = 'none'; 

    const userId = sessionStorage.getItem('userId');

    fetch(`${localhost}/events/users/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        },
    })
    .then(response => response.json())
    .then(events => {
        const meineEventsContent = document.getElementById('meineEventsContent');
        meineEventsContent.innerHTML = '';

        events.results.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event-item2');

            eventDiv.innerHTML = `
                <div class="event-info">
                    <p>${event.Eventname}, Status: ${event.Eventstatus}</p>
                </div>
                <div class="event-buttons">
                    <button class="btn btn-info" onclick="showDetails(${event.EventID})">Details anzeigen</button>
                    <button class="btn btn-primary" onclick="openEditModal(${event.EventID})">Bearbeiten</button>
                    <button class="btn btn-danger" onclick="confirmDelete(${event.EventID})">Löschen</button>
                </div>
            `;

            meineEventsContent.appendChild(eventDiv);
        });
    })
    .catch(error => {
        console.error('Fehler beim Abrufen der Events', error);
    });

});


termineLink.addEventListener('click', function (event) {
    event.preventDefault();
    termineContent.style.display = 'block';
    meineEventsContent.style.display = 'none';
    eventsContainer2.style.display = 'none'; 

    const userId1 = sessionStorage.getItem('userId');
    fetch(`${localhost}/participants/users/${userId1}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        },
    })
    .then(response => response.json())
    .then(events1 => {
        const termineContent = document.getElementById('termineContent');
        termineContent.innerHTML = '';
        console.log(events1);

        events1.results.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event-item3');

            eventDiv.innerHTML = `
                <div class="event-info3">
                    <p>${event.Eventname}, Status: ${event.Eventstatus}</p>
                </div>
                <div class="event-buttons3">
                <button class="btn btn-danger" onclick="confirmDeleteParticipation(${userId1}, ${event.EventID})">Teilnahme entfernen</button>
                </div>
            `;

            termineContent.appendChild(eventDiv);
        });
    })



    
});


// Delete Teilnahme

function confirmDeleteParticipation(userId, eventId) {
    const confirmation = window.confirm("Sind Sie sicher, dass Sie Ihre Teilnahme entfernen möchten?");

    if (confirmation) {
        deleteParticipation(userId, eventId);
    }
}

function deleteParticipation(userId, eventId) {

    fetch(`${localhost}/participants/remove/${userId}/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        },
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);

        window.location.reload();
    })
    .catch(error => {
        console.error('Fehler beim Entfernen der Teilnahme', error);
    });
}


// Show Details my Events

function showDetails(eventId) {
    fetch(`${localhost}/events/${eventId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(eventDetails => {
        const event = eventDetails.results;

        const detailsModal = document.createElement('div');
        detailsModal.classList.add('modal', 'details-modal');
        detailsModal.id = 'myDetailsModal';
        detailsModal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${event.Eventname}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>ID: ${event.EventID}</p>
                        <p>Status: ${event.Eventstatus}</p>
                        <p>Host: ${event.UserName}</p>
                        <p>Datum: ${formatDate(event.EventDate)}</p>
                        <p>Uhrzeit: ${event.Starttime} - ${event.Endtime}</p>
                        <p>Beschreibung: ${event.Description}</p>
                        <button class="btn btn-primary" onclick="listParticipants(${event.EventID})">Teilnehmerliste sehen</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(detailsModal);

        $(detailsModal).modal('show');

        const teilnehmerListButton = detailsModal.querySelector('.btn-primary');
        teilnehmerListButton.addEventListener('click', function() {
            $(detailsModal).modal('hide');
        });

    })
    .catch(error => {
        console.error('Fehler beim Abrufen der Eventdetails', error);
    });
}


// Show Teilnehmerliste 

function listParticipants(eventId) {
    const authToken = sessionStorage.getItem('authToken');

    fetch(`${localhost}/participants/events/${eventId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
    })
    .then(response => response.json())
    .then(participants => {

        console.log(participants.participants);

        $('#myDetailsModal').modal('hide');

        const modalBody = document.getElementById('participantListModalBody');

        modalBody.innerHTML = '';

        const participantList = document.createElement('ul');
        participants.participants.forEach(participant => {
            const listItem = document.createElement('li');
            listItem.textContent = participant.UserName;
            participantList.appendChild(listItem);
        });

        modalBody.appendChild(participantList);

        $('#participantListModal').modal('show');

    })
    .catch(error => {
        console.error('Fehler beim Abrufen der Teilnehmerliste', error);
    });
}


// Remove Events

function confirmDelete(eventId) {

    const userConfirmed = confirm("Das Löschen dieses Events führt zum endgültigen Verlust aller Informationen. Sind Sie sicher, dass Sie fortfahren möchten?");


    if (userConfirmed) {
        deleteEvent(eventId);
    } else {
       
        console.log("Löschung durch den Nutzer abgebrochen.");
    }
}

function deleteEvent(eventId) {
    const authToken = sessionStorage.getItem('authToken');

    fetch(`${localhost}/events/remove/${eventId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);

        alert(result.message);

        
        window.location.reload();

    })
    .catch(error => {
        console.error(error);
    });
}


// Edit Event

function openEditModal(eventId) {
    fetch(`${localhost}/events/${eventId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => response.json())
    .then(eventDetails => {
        
        displayEditEventModal(eventDetails.results);
    })
    .catch(error => {
        console.error('Fehler beim Abrufen von Event-Details zur Änderung:', error);
    });
}

function displayEditEventModal(event) {
    const modalId = `editEventModal-${event.EventID}`;

    const modalContent = `
        <div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="editEventModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editEventModalLabel">Event bearbeiten</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="editEventForm" onsubmit="editEvent(event, ${event.EventID})">
                            <div class="form-group">
                                <label for="editEventName">Name:</label>
                                <input type="text" class="form-control" id="editEventName" value="${event.Eventname}" required>
                            </div>
                            <div class="form-group">
                                <label for="editEventDate">Datum:</label>
                                <input type="date" class="form-control" id="editEventDate" value="${formatDate(event.EventDate, "YYYY-MM-DD")}" required>
                            </div>
                            <div class="form-group">
                                <label for="editStartTime">Anfangszeit:</label>
                                <input type="time" class="form-control" id="editStartTime" value="${event.Starttime}" required>
                            </div>
                            <div class="form-group">
                                <label for="editEndTime">Endzeit:</label>
                                <input type="time" class="form-control" id="editEndTime" value="${event.Endtime}" required>
                            </div>
                            <div class="form-group">
                                <label for="editEventStatus">Status:</label>
                                <select class="form-control" id="editEventStatus" required>
                                    <option value="Offen" ${event.Eventstatus === 'Offen' ? 'selected' : ''}>Offen</option>
                                    <option value="Geschlossen" ${event.Eventstatus === 'Geschlossen' ? 'selected' : ''}>Geschlossen</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="editEventDescription">Beschreibung:</label>
                                <textarea class="form-control" id="editEventDescription" required>${event.Description}</textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Event aktualisieren</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalContent);

    $(`#${modalId}`).modal('show');
}

function editEvent(event, eventId) {
    event.preventDefault();

    const authToken = sessionStorage.getItem('authToken');

    if (!authToken) {
        alert('Sie müssen angemeldet sein, um ein Event zu bearbeiten!');
        return;
    }

    const eventName = document.getElementById('editEventName').value;
    const eventDate = document.getElementById('editEventDate').value;
    const startTime = document.getElementById('editStartTime').value;
    const endTime = document.getElementById('editEndTime').value;
    const eventStatus = document.getElementById('editEventStatus').value;
    const eventDescription = document.getElementById('editEventDescription').value;

    const data = {
        eventname: eventName,
        eventDate: eventDate,
        startTime: startTime,
        endTime: endTime,
        eventStatus: eventStatus,
        description: eventDescription
    };

    fetch(`${localhost}/events/update/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(apiResponse => {
        if (apiResponse.success === 'yes') {
            $(`#editEventModal-${eventId}`).modal('hide');
            alert(apiResponse.message);
        } else {
            console.log(apiResponse);
            alert(apiResponse.error);
        }
    })
    .catch(error => {
        console.error('Fehler :', error);
    });
}





const loggedInNavbarElements = [
    "<a class='nav-link' href='/dashboard'>Dashboard</a>",
    "<a class='nav-link' href='/profiles'>Profiles</a>",
    "<a class='nav-link' href='/new'>New</a>"
];

fetch("/api/auth/loggedin")
    .then(res => res.json())
    .then(data => {
        let onlineStatus;
        if (!data) {
            onlineStatus = "<a class='nav-link' href='/login'>Login</a>"
            
        } else {
            onlineStatus = "<a class='nav-link' href='/api/auth/logout'>Logout</a>";
            loggedInNavbarElements.forEach(elem => $(".navbar-nav").append(elem))
        }
        $("#menu").append(onlineStatus);
    })
    .catch(err => console.error(err));